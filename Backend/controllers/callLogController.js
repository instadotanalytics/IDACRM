import CallLog from '../models/CallLog.js';

// @desc    Add new call log (Manual Entry) - WITH TRACKING
// @route   POST /api/calls
export const addCallLog = async (req, res) => {
    try {
        const {
            leadName, leadPhone, leadEmail, courseInterest,
            callType, callStatus, duration, callTime,
            notes, followUpRequired, followUpDate
        } = req.body;

        console.log('Adding call log for:', leadName, leadPhone);
        console.log('Counselor ID:', req.user.id);
        console.log('Counselor Name:', req.user.name);

        if (!leadName) {
            return res.status(400).json({ success: false, message: 'Lead name is required' });
        }
        if (!leadPhone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // ✅ Auto-add counselor tracking fields
        const callLog = await CallLog.create({
            leadName: leadName.trim(),
            leadPhone: leadPhone.trim(),
            leadEmail: leadEmail || '',
            courseInterest: courseInterest || '',
            callType: callType || 'Outgoing',
            callStatus: callStatus || 'Connected',
            duration: duration || 0,
            callTime: callTime || Date.now(),
            notes: notes || '',
            followUpRequired: followUpRequired || false,
            followUpDate: followUpDate || null,
            counselorId: req.user.id,           // ✅ Auto track counselor ID
            counselorName: req.user.name,       // ✅ Auto track counselor name
            createdBy: req.user.id
        });

        console.log('Call log added with counselorId:', callLog.counselorId);

        res.status(201).json({
            success: true,
            message: 'Call log added successfully',
            data: callLog
        });
    } catch (error) {
        console.error('Add call log error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get today's calls (for logged-in counselor)
// @route   GET /api/calls/today
export const getTodayCalls = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // ✅ Filter by logged-in counselor
        const calls = await CallLog.find({
            counselorId: req.user.id,
            callTime: { $gte: today, $lt: tomorrow }
        }).sort('-callTime');
        
        const stats = {
            total: calls.length,
            outgoing: calls.filter(c => c.callType === 'Outgoing').length,
            incoming: calls.filter(c => c.callType === 'Incoming').length,
            connected: calls.filter(c => c.callStatus === 'Connected').length,
            notAnswered: calls.filter(c => c.callStatus === 'Not Answered').length,
            totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0)
        };
        
        res.json({ success: true, data: calls, stats });
    } catch (error) {
        console.error('Get today calls error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get weekly call stats (for logged-in counselor)
// @route   GET /api/calls/weekly
export const getWeeklyCalls = async (req, res) => {
    try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        
        // ✅ Filter by logged-in counselor
        const calls = await CallLog.find({
            counselorId: req.user.id,
            callTime: { $gte: weekStart }
        }).sort('callTime');
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyStats = {};
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dayName = days[date.getDay()];
            dailyStats[dayName] = { date: dayName, calls: 0, duration: 0 };
        }
        
        calls.forEach(call => {
            const dayName = days[new Date(call.callTime).getDay()];
            if (dailyStats[dayName]) {
                dailyStats[dayName].calls++;
                dailyStats[dayName].duration += call.duration || 0;
            }
        });
        
        res.json({ success: true, data: Object.values(dailyStats) });
    } catch (error) {
        console.error('Get weekly calls error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all calls (Admin can see all, Counselor sees only their own)
// @route   GET /api/calls
export const getAllCalls = async (req, res) => {
    try {
        const { startDate, endDate, callType, callStatus, search } = req.query;
        
        let query = {};
        
        // ✅ Role-based filtering
        if (req.user.role === 'counselor') {
            query.counselorId = req.user.id;
        }
        
        if (startDate && endDate) {
            query.callTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (callType && callType !== 'all') query.callType = callType;
        if (callStatus && callStatus !== 'all') query.callStatus = callStatus;
        
        if (search) {
            query.$or = [
                { leadName: { $regex: search, $options: 'i' } },
                { leadPhone: { $regex: search, $options: 'i' } },
                { leadEmail: { $regex: search, $options: 'i' } }
            ];
        }
        
        let calls = await CallLog.find(query)
            .populate('counselorId', 'name email')
            .sort('-callTime');
        
        // ✅ If admin, show all; if counselor, already filtered
        res.json({ success: true, data: calls });
    } catch (error) {
        console.error('Get all calls error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get calls by specific counselor (Admin only)
// @route   GET /api/calls/counselor/:counselorId
export const getCallsByCounselor = async (req, res) => {
    try {
        const { counselorId } = req.params;
        
        // ✅ Admin only or same counselor
        if (req.user.role !== 'admin_manager' && req.user.role !== 'super_admin' && req.user.id !== counselorId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only view your own calls.' 
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const calls = await CallLog.find({ counselorId })
            .populate('counselorId', 'name email')
            .sort({ callTime: -1 });
        
        const stats = {
            total: calls.length,
            today: calls.filter(c => new Date(c.callTime) >= today).length,
            outgoing: calls.filter(c => c.callType === 'Outgoing').length,
            incoming: calls.filter(c => c.callType === 'Incoming').length,
            connected: calls.filter(c => c.callStatus === 'Connected').length,
            notAnswered: calls.filter(c => c.callStatus === 'Not Answered').length
        };
        
        res.json({ 
            success: true, 
            data: calls, 
            stats,
            counselorId: counselorId 
        });
    } catch (error) {
        console.error('getCallsByCounselor error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get calls by counselor for dashboard
// @route   GET /api/calls/counselor/:counselorId
export const getCallsByCounselorForDashboard = async (req, res) => {
    try {
        const counselorId = req.params.counselorId || req.user._id;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const calls = await CallLog.find({ counselorId })
            .sort({ callTime: -1 });
        
        const stats = {
            total: calls.length,
            today: calls.filter(c => new Date(c.callTime) >= today).length,
            outgoing: calls.filter(c => c.callType === 'Outgoing').length,
            incoming: calls.filter(c => c.callType === 'Incoming').length,
            connected: calls.filter(c => c.callStatus === 'Connected').length
        };
        
        res.json({ success: true, data: calls, stats });
    } catch (error) {
        console.error('getCallsByCounselorForDashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update call log
// @route   PUT /api/calls/:id
export const updateCallLog = async (req, res) => {
    try {
        const callLog = await CallLog.findById(req.params.id);
        
        if (!callLog) {
            return res.status(404).json({ success: false, message: 'Call log not found' });
        }
        
        // ✅ Check permission: can only update own calls (unless admin)
        if (req.user.role !== 'admin_manager' && req.user.role !== 'super_admin' && callLog.counselorId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only update your own calls.' 
            });
        }
        
        const updatedCallLog = await CallLog.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user.id },
            { new: true, runValidators: true }
        );
        
        res.json({ success: true, message: 'Call log updated', data: updatedCallLog });
    } catch (error) {
        console.error('Update call log error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete call log
// @route   DELETE /api/calls/:id
export const deleteCallLog = async (req, res) => {
    try {
        const callLog = await CallLog.findById(req.params.id);
        
        if (!callLog) {
            return res.status(404).json({ success: false, message: 'Call log not found' });
        }
        
        // ✅ Check permission: can only delete own calls (unless admin)
        if (req.user.role !== 'admin_manager' && req.user.role !== 'super_admin' && callLog.counselorId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only delete your own calls.' 
            });
        }
        
        await callLog.deleteOne();
        res.json({ success: true, message: 'Call log deleted' });
    } catch (error) {
        console.error('Delete call log error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get counselor wise call statistics (Admin report)
// @route   GET /api/calls/counselor-stats
export const getCounselorWiseCallStats = async (req, res) => {
    try {
        // ✅ Admin only
        if (req.user.role !== 'admin_manager' && req.user.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin access required.' 
            });
        }
        
        const stats = await CallLog.aggregate([
            {
                $group: {
                    _id: '$counselorId',
                    totalCalls: { $sum: 1 },
                    connectedCalls: { 
                        $sum: { $cond: [{ $eq: ['$callStatus', 'Connected'] }, 1, 0] } 
                    },
                    outgoingCalls: { 
                        $sum: { $cond: [{ $eq: ['$callType', 'Outgoing'] }, 1, 0] } 
                    },
                    incomingCalls: { 
                        $sum: { $cond: [{ $eq: ['$callType', 'Incoming'] }, 1, 0] } 
                    },
                    totalDuration: { $sum: '$duration' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'counselor'
                }
            },
            {
                $unwind: '$counselor'
            },
            {
                $project: {
                    counselorId: '$_id',
                    counselorName: '$counselor.name',
                    counselorEmail: '$counselor.email',
                    totalCalls: 1,
                    connectedCalls: 1,
                    outgoingCalls: 1,
                    incomingCalls: 1,
                    totalDuration: 1,
                    connectionRate: {
                        $multiply: [{ $divide: ['$connectedCalls', { $max: ['$totalCalls', 1] }] }, 100]
                    }
                }
            },
            { $sort: { totalCalls: -1 } }
        ]);
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('getCounselorWiseCallStats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};