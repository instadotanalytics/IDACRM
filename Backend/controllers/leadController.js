import Lead from '../models/Lead.js';

// @desc    Get all leads (Admin only)
// @route   GET /api/leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    // Calculate stats
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      interested: leads.filter(l => l.status === 'Interested').length,
      followup: leads.filter(l => l.status === 'Follow-up').length,
      converted: leads.filter(l => l.status === 'Converted').length,
      lost: leads.filter(l => l.status === 'Lost').length
    };
    
    res.json({
      success: true,
      data: leads,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leads by counselor ID
// @route   GET /api/leads/counselor/:counselorId
export const getLeadsByCounselor = async (req, res) => {
  try {
    const counselorId = req.params.counselorId || req.query.counselorId || req.user?._id;
    
    const leads = await Lead.find({ assignedTo: counselorId })
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
    
    res.json({
      success: true,
      data: leads,
      stats,
      role: req.user?.role,
      counselorId: counselorId
    });
  } catch (error) {
    console.error('getLeadsByCounselor error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    if (req.user?.role === 'counselor' && lead.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create lead
// @route   POST /api/leads
export const createLead = async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      assignedTo: req.body.assignedTo || req.user._id,
      createdBy: req.user._id
    });
    
    const savedLead = await lead.save();
    
    res.status(201).json({
      success: true,
      data: savedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    if (req.user?.role === 'counselor' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    await lead.deleteOne();
    
    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add call log to lead
// @route   POST /api/leads/:id/call
export const addLeadCall = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    const newCall = {
      date: new Date(),
      duration: req.body.duration || '0',
      notes: req.body.notes || '',
      callType: req.body.callType || 'Outgoing'
    };
    
    lead.calls.push(newCall);
    await lead.save();
    
    res.json({
      success: true,
      message: 'Call log added successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get leads by counselor ID for dashboard
// @route   GET /api/leads/counselor/:counselorId
export const getLeadsByCounselorForDashboard = async (req, res) => {
    try {
        const counselorId = req.params.counselorId || req.user._id;
        
        const leads = await Lead.find({ assignedTo: counselorId })
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