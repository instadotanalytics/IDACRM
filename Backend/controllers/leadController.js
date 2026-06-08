import Lead from '../models/Lead.js';

// @desc    Get all leads (Admin only)
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('counselorId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      interested: leads.filter(l => l.status === 'Interested').length,
      followup: leads.filter(l => l.status === 'Follow-up').length,
      converted: leads.filter(l => l.status === 'Converted').length,
      lost: leads.filter(l => l.status === 'Lost').length
    };
    
    res.json({ success: true, data: leads, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leads by counselor ID (for tracking)
export const getLeadsByCounselor = async (req, res) => {
  try {
    const counselorId = req.params.counselorId || req.query.counselorId || req.user?._id;
    
    const leads = await Lead.find({ counselorId: counselorId })
      .populate('counselorId', 'name email')
      .sort({ createdAt: -1 });
    
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      interested: leads.filter(l => l.status === 'Interested').length,
      followup: leads.filter(l => l.status === 'Follow-up').length,
      converted: leads.filter(l => l.status === 'Converted').length,
      lost: leads.filter(l => l.status === 'Lost').length
    };
    
    res.json({ success: true, data: leads, stats, counselorId });
  } catch (error) {
    console.error('getLeadsByCounselor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lead
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('counselorId', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    
    // ✅ Counselor can only see their own leads
    if (req.user?.role === 'counselor' && lead.counselorId?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lead (with counselor tracking)
export const createLead = async (req, res) => {
  try {
    const currentUser = req.user;
    
    const lead = new Lead({
      ...req.body,
      counselorId: currentUser._id,           // ✅ Auto-track counselor ID
      counselorName: currentUser.name,         // ✅ Auto-track counselor name
      assignedTo: req.body.assignedTo || currentUser._id,
      createdBy: currentUser._id
    });
    
    const savedLead = await lead.save();
    
    res.status(201).json({ success: true, data: savedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lead
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    
    // ✅ Counselor can only update their own leads
    if (req.user?.role === 'counselor' && lead.counselorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    
    await lead.deleteOne();
    
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leads by counselor for dashboard (tracking)
export const getLeadsByCounselorForDashboard = async (req, res) => {
    try {
        const counselorId = req.params.counselorId || req.user._id;
        
        const leads = await Lead.find({ counselorId: counselorId })
            .sort({ createdAt: -1 });
        
        const stats = {
            total: leads.length,
            new: leads.filter(l => l.status === 'New').length,
            contacted: leads.filter(l => l.status === 'Contacted').length,
            interested: leads.filter(l => l.status === 'Interested').length,
            converted: leads.filter(l => l.status === 'Converted').length
        };
        
        res.json({ success: true, data: leads, stats });
    } catch (error) {
        console.error('getLeadsByCounselorForDashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get counselor wise lead statistics (for admin report)
export const getCounselorWiseStats = async (req, res) => {
    try {
        const stats = await Lead.aggregate([
            {
                $group: {
                    _id: '$counselorId',
                    totalLeads: { $sum: 1 },
                    convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
                    newLeads: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
                    contactedLeads: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } }
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
                    totalLeads: 1,
                    convertedLeads: 1,
                    newLeads: 1,
                    contactedLeads: 1,
                    conversionRate: {
                        $multiply: [{ $divide: ['$convertedLeads', { $max: ['$totalLeads', 1] }] }, 100]
                    }
                }
            },
            { $sort: { totalLeads: -1 } }
        ]);
        
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};