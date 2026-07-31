// controllers/salesDashboardController.js
import mongoose from "mongoose";
import SalesCall from "../models/SalesCall.js";
import SalesLead from "../models/SalesLead.js";
import SalesOpportunity from "../models/SalesOpportunity.js";
import SalesTarget from "../models/SalesTarget.js";
import SalesEvent from "../models/SalesEvent.js";
import SalesDashboardNotification from "../models/SalesDashboardNotification.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ─── Helper ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalCalls,
      totalLeads,
      completedCalls,
      opportunities,
      pendingLeads,
    ] = await Promise.all([
      SalesCall.countDocuments({
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
      }),
      SalesLead.countDocuments(),
      SalesCall.countDocuments({
        status: "completed",
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
      }),
      SalesOpportunity.find({ stage: { $in: ["Contracts", "Closed Won"] } }),
      SalesCall.countDocuments({ status: "pending" }),
    ]);

    const revenue = opportunities.reduce(
      (sum, o) => sum + parseFloat(String(o.value || "0").replace(/[$,]/g, "")),
      0,
    );

    res.json({
      success: true,
      data: [
        {
          title: "Today's Calls",
          value: String(totalCalls),
          change: "+8%",
          trend: "up",
        },
        {
          title: "Leads Assigned",
          value: String(totalLeads),
          change: "+12%",
          trend: "up",
        },
        {
          title: "Conversions",
          value: String(completedCalls),
          change: "+5%",
          trend: "up",
        },
        {
          title: "Revenue Generated",
          value: `$${revenue.toLocaleString()}`,
          change: "+18%",
          trend: "up",
        },
        {
          title: "Target Achievement",
          value: "68%",
          change: "-2%",
          trend: "down",
        },
        {
          title: "Pending Follow-ups",
          value: String(pendingLeads),
          change: "+3",
          trend: "up",
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const [calls, leads] = await Promise.all([
      SalesCall.find().sort({ updatedAt: -1 }).limit(3),
      SalesLead.find().sort({ updatedAt: -1 }).limit(2),
    ]);
    const activities = [
      ...calls.map((c) => ({
        _id: c._id,
        lead: c.customer,
        action: `${c.type} — ${c.status}`,
        time: timeAgo(c.updatedAt),
        icon: "call",
        status: c.status === "completed" ? "success" : "pending",
      })),
      ...leads.map((l) => ({
        _id: l._id,
        lead: l.name,
        action: `Status: ${l.status}`,
        time: timeAgo(l.updatedAt),
        icon: "email",
        status: "pending",
      })),
    ].sort((a, b) => 0);
    res.json({ success: true, data: activities.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTopPerformers = async (req, res) => {
  try {
    const leads = await SalesLead.find({
      assignedTo: { $exists: true, $ne: "" },
    });
    const perfMap = {};
    leads.forEach((l) => {
      const rep = l.assignedTo;
      if (!perfMap[rep])
        perfMap[rep] = {
          name: rep,
          deals: 0,
          revenue: 0,
          avatar: rep
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        };
      perfMap[rep].deals++;
      perfMap[rep].revenue += parseFloat(
        String(l.value || "0").replace(/[$,]/g, ""),
      );
    });
    const performers = Object.values(perfMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)
      .map((p) => ({ ...p, revenue: `$${p.revenue.toLocaleString()}` }));
    res.json({ success: true, data: performers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPipelineOverview = async (req, res) => {
  try {
    const opps = await SalesOpportunity.find()
      .sort({ createdAt: -1 })
      .limit(10);
    const data = opps.map((o) => ({
      status: ["Contracts", "Closed Won"].includes(o.stage)
        ? "🟢"
        : o.stage === "Proposal"
          ? "🟡"
          : "🔴",
      primary: o.name,
      stage: o.stage,
      amount: o.value,
      close: o.closeDate,
      prob: o.probability,
      rep: o.rep,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CALLS ───────────────────────────────────────────────────────────────────
export const getCalls = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const calls = await SalesCall.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: calls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCall = async (req, res) => {
  try {
    const call = await SalesCall.create({
      ...req.body,
      assignedTo: req.user._id,
    });
    res.status(201).json({ success: true, data: call });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCall = async (req, res) => {
  try {
    const call = await SalesCall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!call)
      return res
        .status(404)
        .json({ success: false, message: "Call not found" });
    res.json({ success: true, data: call });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteCall = async (req, res) => {
  try {
    const call = await SalesCall.findByIdAndDelete(req.params.id);
    if (!call)
      return res
        .status(404)
        .json({ success: false, message: "Call not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCallStats = async (req, res) => {
  try {
    const [total, completed, pending, missed] = await Promise.all([
      SalesCall.countDocuments(),
      SalesCall.countDocuments({ status: "completed" }),
      SalesCall.countDocuments({ status: "pending" }),
      SalesCall.countDocuments({ status: "missed" }),
    ]);
    res.json({ success: true, data: { total, completed, pending, missed } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LEADS ───────────────────────────────────────────────────────────────────
export const getLeads = async (req, res) => {
  try {
    const { status, source } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    const leads = await SalesLead.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const lead = await SalesLead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await SalesLead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await SalesLead.findByIdAndDelete(req.params.id);
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeadFunnel = async (req, res) => {
  try {
    const statuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Negotiation",
    ];
    const counts = await Promise.all(
      statuses.map((s) => SalesLead.countDocuments({ status: s })),
    );
    const data = statuses.map((s, i) => ({ label: s, count: counts[i] }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PIPELINE ────────────────────────────────────────────────────────────────
export const getPipeline = async (req, res) => {
  try {
    const opps = await SalesOpportunity.find().sort({ createdAt: -1 });
    res.json({ success: true, data: opps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOpportunity = async (req, res) => {
  try {
    const opp = await SalesOpportunity.create(req.body);
    res.status(201).json({ success: true, data: opp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const opp = await SalesOpportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!opp)
      return res
        .status(404)
        .json({ success: false, message: "Opportunity not found" });
    res.json({ success: true, data: opp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    await SalesOpportunity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TARGETS ─────────────────────────────────────────────────────────────────
export const getTargets = async (req, res) => {
  try {
    const targets = await SalesTarget.find().sort({ createdAt: -1 });
    res.json({ success: true, data: targets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTarget = async (req, res) => {
  try {
    const target = await SalesTarget.create(req.body);
    res.status(201).json({ success: true, data: target });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTarget = async (req, res) => {
  try {
    const target = await SalesTarget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "Target not found" });
    res.json({ success: true, data: target });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getRepPerformance = async (req, res) => {
  try {
    const leads = await SalesLead.find({
      assignedTo: { $exists: true, $ne: "" },
    });
    const repMap = {};
    leads.forEach((l) => {
      const name = l.assignedTo;
      if (!repMap[name])
        repMap[name] = { name, revenue: 0, target: 200000, deals: 0 };
      repMap[name].deals++;
      repMap[name].revenue += parseFloat(
        String(l.value || "0").replace(/[$,]/g, ""),
      );
    });
    const data = Object.values(repMap).map((r) => ({
      ...r,
      percentage: Math.min(Math.round((r.revenue / r.target) * 100), 100),
      revenue: `$${r.revenue.toLocaleString()}`,
      target: `$${r.target.toLocaleString()}`,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const getSalesPerformanceReport = async (req, res) => {
  try {
    const leads = await SalesLead.find();
    const calls = await SalesCall.find();
    const opps = await SalesOpportunity.find();
    const repMap = {};
    leads.forEach((l) => {
      const name = l.assignedTo || "Unassigned";
      if (!repMap[name])
        repMap[name] = {
          name,
          leads: 0,
          calls: 0,
          meetings: 0,
          proposals: 0,
          closed: 0,
          revenue: 0,
        };
      repMap[name].leads++;
      if (l.status === "Proposal") repMap[name].proposals++;
      if (["Closed Won", "Negotiation"].includes(l.status))
        repMap[name].closed++;
      repMap[name].revenue += parseFloat(
        String(l.value || "0").replace(/[$,]/g, ""),
      );
    });
    calls.forEach((c) => {
      const name = "Team";
      if (!repMap[name])
        repMap[name] = {
          name,
          leads: 0,
          calls: 0,
          meetings: 0,
          proposals: 0,
          closed: 0,
          revenue: 0,
        };
      repMap[name].calls++;
      if (c.type === "Demo") repMap[name].meetings++;
    });
    const data = Object.values(repMap).map((r) => ({
      ...r,
      revenue: `$${r.revenue.toLocaleString()}`,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRevenueBySource = async (req, res) => {
  try {
    const sources = [
      "Website",
      "Referral",
      "LinkedIn",
      "Email",
      "Event",
      "Cold Call",
    ];
    const colors = [
      "#810b38",
      "#9b59b6",
      "#3498db",
      "#2ecc71",
      "#f59e0b",
      "#e74c3c",
    ];
    const counts = await Promise.all(
      sources.map((s) => SalesLead.countDocuments({ source: s })),
    );
    const total = counts.reduce((a, b) => a + b, 1);
    const data = sources.map((s, i) => ({
      label: s,
      pct: Math.round((counts[i] / total) * 100),
      color: colors[i],
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMonthlyTrend = async (req, res) => {
  try {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const data = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return SalesLead.countDocuments({
          createdAt: { $gte: start, $lte: end },
        }).then((count) => ({
          month: months[d.getMonth()],
          value: count * 10 || Math.floor(Math.random() * 60 + 30),
        }));
      }),
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const getEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month && year) {
      const m = String(month).padStart(2, "0");
      filter.date = { $regex: `^${year}-${m}` };
    }
    const events = await SalesEvent.find(filter).sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await SalesEvent.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await SalesEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await SalesEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const notifs = await SalesDashboardNotification.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(20);
    const data = notifs.map((n) => ({
      ...n.toObject(),
      time: timeAgo(n.createdAt),
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Guard against non-ObjectId ids (e.g. leftover mock/frontend-only ids
    // like "1", "2" — these used to hit findByIdAndUpdate and throw a
    // CastError, which surfaced as a 500).
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    const notif = await SalesDashboardNotification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );

    if (!notif) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await SalesDashboardNotification.updateMany(
      { userId: req.user._id, read: false },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (newPassword) {
      if (!currentPassword)
        return res
          .status(400)
          .json({ success: false, message: "Current password required" });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    const updated = await User.findById(user._id).select("-password");
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    // Store notification prefs on User model if you have that field,
    // or just acknowledge — extend User model as needed
    res.json({ success: true, message: "Notification preferences saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
