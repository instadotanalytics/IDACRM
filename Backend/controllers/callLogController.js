// controllers/callLogController.js - UPDATED WITH SOCKET.IO
import CallLog from "../models/CallLog.js";
import mongoose from "mongoose";

// @desc    Add new call log (Manual Entry) - WITH TRACKING & SOCKET.IO
// @route   POST /api/calls
export const addCallLog = async (req, res, io) => {
  try {
    const {
      leadName,
      leadPhone,
      leadEmail,
      courseInterest,
      callType,
      callStatus,
      duration,
      callTime,
      notes,
      followUpRequired,
      followUpDate,
    } = req.body;

    console.log("=========================================");
    console.log("📞 Adding call log for:", leadName);
    console.log("👤 Counselor ID:", req.user.id);
    console.log("👤 Counselor Name:", req.user.name);
    console.log("=========================================");

    if (!leadName) {
      return res
        .status(400)
        .json({ success: false, message: "Lead name is required" });
    }
    if (!leadPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const callLog = await CallLog.create({
      leadName: leadName.trim(),
      leadPhone: leadPhone.trim(),
      leadEmail: leadEmail || "",
      courseInterest: courseInterest || "",
      callType: callType || "Outgoing",
      callStatus: callStatus || "Connected",
      duration: parseInt(duration) || 0,
      callTime: callTime || new Date(),
      notes: notes || "",
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate || null,
      counselorId: req.user.id,
      counselorName: req.user.name,
      createdBy: req.user.id,
    });

    console.log("✅ Call log added with ID:", callLog._id);

    // 🔔 EMIT SOCKET.IO EVENTS
    if (io) {
      // Emit to all clients
      io.emit("call-log-created", {
        callLog,
        action: "created",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // Emit to admin/managers
      io.to("role_admin_manager").emit("call-log-created", {
        callLog,
        action: "created",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // Emit to specific counselor
      io.to(`user_${req.user.id}`).emit("call-log-created", {
        callLog,
        action: "created",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // Emit real-time stats update
      await emitStatsUpdate(io, req.user.id);
    }

    res.status(201).json({
      success: true,
      message: "Call log added successfully",
      data: callLog,
    });
  } catch (error) {
    console.error("Add call log error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update call log - WITH SOCKET.IO
// @route   PUT /api/calls/:id
export const updateCallLog = async (req, res, io) => {
  try {
    const callLog = await CallLog.findById(req.params.id);

    if (!callLog) {
      return res
        .status(404)
        .json({ success: false, message: "Call log not found" });
    }

    if (
      req.user.role !== "admin_manager" &&
      req.user.role !== "super_admin" &&
      callLog.counselorId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own calls.",
      });
    }

    const updatedCallLog = await CallLog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true },
    );

    // 🔔 EMIT SOCKET.IO EVENTS
    if (io) {
      io.emit("call-log-updated", {
        callLog: updatedCallLog,
        action: "updated",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // Emit to specific counselor
      io.to(`user_${callLog.counselorId}`).emit("call-log-updated", {
        callLog: updatedCallLog,
        action: "updated",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // If status changed, emit specific event
      if (req.body.callStatus && req.body.callStatus !== callLog.callStatus) {
        io.emit("call-status-changed", {
          callId: req.params.id,
          oldStatus: callLog.callStatus,
          newStatus: req.body.callStatus,
          callLog: updatedCallLog,
          updatedBy: req.user.name,
          timestamp: new Date(),
        });
      }

      // Emit real-time stats update
      await emitStatsUpdate(io, callLog.counselorId);
    }

    res.json({
      success: true,
      message: "Call log updated",
      data: updatedCallLog,
    });
  } catch (error) {
    console.error("Update call log error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete call log - WITH SOCKET.IO
// @route   DELETE /api/calls/:id
export const deleteCallLog = async (req, res, io) => {
  try {
    const callLog = await CallLog.findById(req.params.id);

    if (!callLog) {
      return res
        .status(404)
        .json({ success: false, message: "Call log not found" });
    }

    if (
      req.user.role !== "admin_manager" &&
      req.user.role !== "super_admin" &&
      callLog.counselorId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own calls.",
      });
    }

    const deletedCall = { ...callLog._doc };
    await callLog.deleteOne();

    // 🔔 EMIT SOCKET.IO EVENTS
    if (io) {
      io.emit("call-log-deleted", {
        callId: req.params.id,
        callLog: deletedCall,
        action: "deleted",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // Emit to specific counselor
      io.to(`user_${callLog.counselorId}`).emit("call-log-deleted", {
        callId: req.params.id,
        callLog: deletedCall,
        action: "deleted",
        by: req.user.name,
        byId: req.user.id,
        timestamp: new Date(),
      });

      // Emit real-time stats update
      await emitStatsUpdate(io, callLog.counselorId);
    }

    res.json({ success: true, message: "Call log deleted" });
  } catch (error) {
    console.error("Delete call log error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// HELPER FUNCTION - EMIT STATS UPDATE
// ============================================

const emitStatsUpdate = async (io, userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayCalls, totalCalls] = await Promise.all([
      CallLog.find({
        counselorId: userId,
        callTime: { $gte: today, $lt: tomorrow },
      }),
      CallLog.countDocuments({ counselorId: userId }),
    ]);

    const stats = {
      today: {
        total: todayCalls.length,
        connected: todayCalls.filter((c) => c.callStatus === "Connected")
          .length,
        notAnswered: todayCalls.filter((c) => c.callStatus === "Not Answered")
          .length,
        busy: todayCalls.filter((c) => c.callStatus === "Busy").length,
        wrongNumber: todayCalls.filter((c) => c.callStatus === "Wrong Number")
          .length,
        totalDuration: todayCalls.reduce(
          (sum, c) => sum + (c.duration || 0),
          0,
        ),
      },
      total: totalCalls,
      timestamp: new Date(),
    };

    io.to(`user_${userId}`).emit("stats-update", stats);

    // Also emit to admin for monitoring
    io.to("role_admin_manager").emit("stats-update", stats);
    io.to("role_super_admin").emit("stats-update", stats);
  } catch (error) {
    console.error("Error emitting stats update:", error);
  }
};

// ============================================
// EXISTING CONTROLLER FUNCTIONS
// (These remain unchanged)
// ============================================

// @desc    Get today's calls
// @route   GET /api/calls/today
export const getTodayCalls = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = {
      callTime: { $gte: today, $lt: tomorrow },
    };

    if (req.user.role !== "admin_manager" && req.user.role !== "super_admin") {
      query.counselorId = req.user.id;
    }

    const calls = await CallLog.find(query)
      .populate("counselorId", "name email")
      .sort({ callTime: -1 });

    const stats = {
      total: calls.length,
      outgoing: calls.filter((c) => c.callType === "Outgoing").length,
      incoming: calls.filter((c) => c.callType === "Incoming").length,
      connected: calls.filter((c) => c.callStatus === "Connected").length,
      notAnswered: calls.filter((c) => c.callStatus === "Not Answered").length,
      busy: calls.filter((c) => c.callStatus === "Busy").length,
      wrongNumber: calls.filter((c) => c.callStatus === "Wrong Number").length,
      totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0),
    };

    res.json({ success: true, data: calls, stats });
  } catch (error) {
    console.error("Get today calls error:", error);
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

    let query = {
      callTime: { $gte: weekStart },
    };

    if (req.user.role !== "admin_manager" && req.user.role !== "super_admin") {
      query.counselorId = req.user.id;
    }

    const calls = await CallLog.find(query).sort("callTime");

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayName = days[date.getDay()];
      const dayCalls = calls.filter((call) => {
        const callDate = new Date(call.callTime);
        return callDate.toDateString() === date.toDateString();
      });

      weeklyData.push({
        date: dayName,
        fullDate: date.toLocaleDateString(),
        calls: dayCalls.length,
        duration: dayCalls.reduce((sum, c) => sum + (c.duration || 0), 0),
        connected: dayCalls.filter((c) => c.callStatus === "Connected").length,
      });
    }

    res.json({ success: true, data: weeklyData });
  } catch (error) {
    console.error("Get weekly calls error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all calls (with filters)
// @route   GET /api/calls
export const getAllCalls = async (req, res) => {
  try {
    const { startDate, endDate, callType, callStatus, search, counselorId } =
      req.query;

    let query = {};

    if (req.user.role !== "admin_manager" && req.user.role !== "super_admin") {
      query.counselorId = req.user.id;
    } else if (counselorId && counselorId !== "all") {
      query.counselorId = counselorId;
    }

    if (startDate && endDate) {
      query.callTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (callType && callType !== "all") query.callType = callType;
    if (callStatus && callStatus !== "all") query.callStatus = callStatus;

    if (search) {
      query.$or = [
        { leadName: { $regex: search, $options: "i" } },
        { leadPhone: { $regex: search, $options: "i" } },
        { leadEmail: { $regex: search, $options: "i" } },
      ];
    }

    const calls = await CallLog.find(query)
      .populate("counselorId", "name email")
      .sort({ callTime: -1 });

    const stats = {
      total: calls.length,
      outgoing: calls.filter((c) => c.callType === "Outgoing").length,
      incoming: calls.filter((c) => c.callType === "Incoming").length,
      connected: calls.filter((c) => c.callStatus === "Connected").length,
      notAnswered: calls.filter((c) => c.callStatus === "Not Answered").length,
      busy: calls.filter((c) => c.callStatus === "Busy").length,
      wrongNumber: calls.filter((c) => c.callStatus === "Wrong Number").length,
      totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0),
    };

    res.json({ success: true, data: calls, stats });
  } catch (error) {
    console.error("Get all calls error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get calls by counselor
// @route   GET /api/calls/counselor/:counselorId
export const getCallsByCounselor = async (req, res) => {
  try {
    const { counselorId } = req.params;

    if (
      req.user.role !== "admin_manager" &&
      req.user.role !== "super_admin" &&
      req.user.id !== counselorId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own calls.",
      });
    }

    const calls = await CallLog.find({ counselorId })
      .populate("counselorId", "name email")
      .sort({ callTime: -1 });

    const stats = {
      total: calls.length,
      today: calls.filter((c) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(c.callTime) >= today;
      }).length,
      outgoing: calls.filter((c) => c.callType === "Outgoing").length,
      incoming: calls.filter((c) => c.callType === "Incoming").length,
      connected: calls.filter((c) => c.callStatus === "Connected").length,
    };

    res.json({ success: true, data: calls, stats, counselorId });
  } catch (error) {
    console.error("getCallsByCounselor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get calls by counselor for dashboard
// @route   GET /api/calls/counselor/:counselorId
export const getCallsByCounselorForDashboard = async (req, res) => {
  try {
    const counselorId = req.params.counselorId || req.user._id;

    const calls = await CallLog.find({ counselorId }).sort({ callTime: -1 });

    const stats = {
      total: calls.length,
      today: calls.filter((c) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(c.callTime) >= today;
      }).length,
      outgoing: calls.filter((c) => c.callType === "Outgoing").length,
      incoming: calls.filter((c) => c.callType === "Incoming").length,
      connected: calls.filter((c) => c.callStatus === "Connected").length,
    };

    res.json({ success: true, data: calls, stats });
  } catch (error) {
    console.error("getCallsByCounselorForDashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get counselor wise call statistics
// @route   GET /api/calls/counselor-stats
export const getCounselorWiseCallStats = async (req, res) => {
  try {
    if (req.user.role !== "admin_manager" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin access required.",
      });
    }

    const stats = await CallLog.aggregate([
      {
        $group: {
          _id: "$counselorId",
          totalCalls: { $sum: 1 },
          connectedCalls: {
            $sum: { $cond: [{ $eq: ["$callStatus", "Connected"] }, 1, 0] },
          },
          outgoingCalls: {
            $sum: { $cond: [{ $eq: ["$callType", "Outgoing"] }, 1, 0] },
          },
          incomingCalls: {
            $sum: { $cond: [{ $eq: ["$callType", "Incoming"] }, 1, 0] },
          },
          totalDuration: { $sum: "$duration" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "counselor",
        },
      },
      {
        $unwind: "$counselor",
      },
      {
        $project: {
          counselorId: "$_id",
          counselorName: "$counselor.name",
          counselorEmail: "$counselor.email",
          totalCalls: 1,
          connectedCalls: 1,
          outgoingCalls: 1,
          incomingCalls: 1,
          totalDuration: 1,
          connectionRate: {
            $multiply: [
              { $divide: ["$connectedCalls", { $max: ["$totalCalls", 1] }] },
              100,
            ],
          },
        },
      },
      { $sort: { totalCalls: -1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("getCounselorWiseCallStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
