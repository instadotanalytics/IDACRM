import CallLog from '../models/CallLog.js';

// @desc    Add new call log (Manual Entry)
// @route   POST /api/calls
export const addCallLog = async (req, res) => {
    try {
        const {
            leadName, leadPhone, leadEmail, courseInterest,
            callType, callStatus, duration, callTime,
            notes, followUpRequired, followUpDate
        } = req.body;

        console.log('Adding call log for:', leadName, leadPhone);

        if (!leadName) {
            return res.status(400).json({ success: false, message: 'Lead name is required' });
        }
        if (!leadPhone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

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
            counselorId: req.user.id
        });

        console.log('Call log added:', callLog._id);

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

// @desc    Get today's calls
// @route   GET /api/calls/today
export const getTodayCalls = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
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

// @desc    Get weekly call stats
// @route   GET /api/calls/weekly
export const getWeeklyCalls = async (req, res) => {
    try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        
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

// @desc    Get all calls (with filters)
// @route   GET /api/calls
export const getAllCalls = async (req, res) => {
    try {
        const { startDate, endDate, callType, callStatus, search } = req.query;
        
        let query = { counselorId: req.user.id };
        
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
        
        const calls = await CallLog.find(query).sort('-callTime');
        
        res.json({ success: true, data: calls });
    } catch (error) {
        console.error('Get all calls error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get calls by counselor
// @route   GET /api/calls/counselor/:counselorId
export const getCallsByCounselor = async (req, res) => {
    try {
        const { counselorId } = req.params;
        
        if (req.user.role === 'counselor' && req.user.id !== counselorId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only view your own calls.' 
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const calls = await CallLog.find({ counselorId })
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

// @desc    Update call log
// @route   PUT /api/calls/:id
export const updateCallLog = async (req, res) => {
    try {
        const callLog = await CallLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!callLog) {
            return res.status(404).json({ success: false, message: 'Call log not found' });
        }
        
        res.json({ success: true, message: 'Call log updated', data: callLog });
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
        
        await callLog.deleteOne();
        res.json({ success: true, message: 'Call log deleted' });
    } catch (error) {
        console.error('Delete call log error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get calls by counselor ID for dashboard
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
            incoming: calls.filter(c => c.callType === 'Incoming').length
        };
        
        res.json({ success: true, data: calls, stats });
    } catch (error) {
        console.error('getCallsByCounselorForDashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};