// routes/reports.js
import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import CourseMaterial from "../models/CourseMaterial.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

const ALLOWED_ROLES = ["super_admin", "admin_manager"];

function getColorForRole(role) {
  const colors = {
    super_admin: "#f0806c",
    admin_manager: "#5b8def",
    sales_executive: "#5fc98d",
    hr_executive: "#f2b84b",
    trainer: "#9b7ede",
    counselor: "#4dd0c9",
  };
  return colors[role] || "#94a3b8";
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function roleLabel(role) {
  const labels = {
    super_admin: "Super Admin",
    admin_manager: "Admin Manager",
    sales_executive: "Sales Executive",
    hr_executive: "HR Executive",
    trainer: "Trainer",
    counselor: "Counselor",
    student: "Student",
  };
  return labels[role] || role;
}

// ============================================================
// OVERVIEW — headline KPI cards
// ============================================================
router.get("/overview", protect, authorize(ALLOWED_ROLES), async (req, res) => {
  try {
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [
      totalRevenueAgg,
      thisMonthAgg,
      lastMonthAgg,
      totalTransactions,
      totalStaff,
      activeStaff,
      pendingAgg,
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: "income", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            type: "income",
            status: "completed",
            date: { $gte: startOfThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            type: "income",
            status: "completed",
            date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.countDocuments(),
      User.countDocuments({ role: { $ne: "student" } }),
      User.countDocuments({ role: { $ne: "student" }, isActive: true }),
      Transaction.aggregate([
        { $match: { type: "income", status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const thisMonthTotal = thisMonthAgg[0]?.total || 0;
    const lastMonthTotal = lastMonthAgg[0]?.total || 0;
    const growthPercent =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0
          ? 100
          : 0;

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        totalRevenueFormatted: formatINR(totalRevenueAgg[0]?.total || 0),
        thisMonthRevenue: thisMonthTotal,
        thisMonthRevenueFormatted: formatINR(thisMonthTotal),
        growthPercent: Math.round(growthPercent * 10) / 10,
        totalTransactions,
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        pendingAmount: pendingAgg[0]?.total || 0,
        pendingAmountFormatted: formatINR(pendingAgg[0]?.total || 0),
      },
    });
  } catch (error) {
    console.error("Reports overview error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// ============================================================
// REVENUE TRENDS — income vs expense over N months
// ============================================================
router.get(
  "/revenue-trends",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const months = Math.min(parseInt(req.query.months) || 6, 24);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trends = await Transaction.aggregate([
        { $match: { date: { $gte: startDate }, status: "completed" } },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: { year: "$_id.year", month: "$_id.month" },
            income: {
              $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
            },
            expense: {
              $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
            },
            transactionCount: { $sum: "$count" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const formatted = trends.map((t) => ({
        month: new Date(t._id.year, t._id.month - 1).toLocaleString("en-US", {
          month: "short",
        }),
        year: t._id.year,
        income: t.income || 0,
        expense: t.expense || 0,
        net: (t.income || 0) - (t.expense || 0),
        transactionCount: t.transactionCount || 0,
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      console.error("Revenue trends error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

// ============================================================
// STAFF DISTRIBUTION — headcount by role & department
// ============================================================
router.get(
  "/staff-distribution",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const [byRole, byDepartment, activeVsInactive] = await Promise.all([
        User.aggregate([
          { $match: { role: { $ne: "student" } } },
          { $group: { _id: "$role", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: { role: { $ne: "student" } } },
          { $group: { _id: "$department", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: { role: { $ne: "student" } } },
          { $group: { _id: "$isActive", count: { $sum: 1 } } },
        ]),
      ]);

      const totalStaff = byRole.reduce((sum, r) => sum + r.count, 0);

      const formattedByRole = byRole.map((r) => ({
        role: r._id,
        label: roleLabel(r._id),
        count: r.count,
        percentage:
          totalStaff > 0 ? Math.round((r.count / totalStaff) * 100) : 0,
        color: getColorForRole(r._id),
      }));

      const formattedByDepartment = byDepartment.map((d) => ({
        department: d._id || "unassigned",
        count: d.count,
      }));

      const active = activeVsInactive.find((a) => a._id === true)?.count || 0;
      const inactive =
        activeVsInactive.find((a) => a._id === false)?.count || 0;

      res.json({
        success: true,
        data: {
          byRole: formattedByRole,
          byDepartment: formattedByDepartment,
          active,
          inactive,
          total: totalStaff,
        },
      });
    } catch (error) {
      console.error("Staff distribution error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

// ============================================================
// CATEGORY BREAKDOWN — income/expense by category
// ============================================================
router.get(
  "/category-breakdown",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const match = { status: "completed" };
      if (startDate || endDate) {
        match.date = {};
        if (startDate) match.date.$gte = new Date(startDate);
        if (endDate) match.date.$lte = new Date(endDate + "T23:59:59");
      }

      const breakdown = await Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: { category: "$category", type: "$type" },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      const income = breakdown.filter((b) => b._id.type === "income");
      const expense = breakdown.filter((b) => b._id.type === "expense");
      const incomeTotal = income.reduce((sum, b) => sum + b.total, 0);
      const expenseTotal = expense.reduce((sum, b) => sum + b.total, 0);

      const formatRows = (rows, total) =>
        rows.map((r) => ({
          category: r._id.category,
          total: r.total,
          totalFormatted: formatINR(r.total),
          count: r.count,
          percentage: total > 0 ? Math.round((r.total / total) * 100) : 0,
        }));

      res.json({
        success: true,
        data: {
          income: formatRows(income, incomeTotal),
          expense: formatRows(expense, expenseTotal),
          incomeTotal,
          expenseTotal,
          incomeTotalFormatted: formatINR(incomeTotal),
          expenseTotalFormatted: formatINR(expenseTotal),
        },
      });
    } catch (error) {
      console.error("Category breakdown error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

// ============================================================
// EXPORT FULL REPORT (combined CSV)
// ============================================================
router.get("/export", protect, authorize(ALLOWED_ROLES), async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 6, 24);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [
      totalRevenueAgg,
      trends,
      byRole,
      categoryBreakdown,
      courseDistribution,
      academicCounts,
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: "income", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { date: { $gte: startDate }, status: "completed" } },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: { year: "$_id.year", month: "$_id.month" },
            income: {
              $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
            },
            expense: {
              $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      User.aggregate([
        { $match: { role: { $ne: "student" } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: { category: "$category", type: "$type" },
            total: { $sum: "$amount" },
          },
        },
      ]),
      Student.aggregate([
        { $match: { course: { $ne: "" } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: "active" }),
        Batch.countDocuments(),
        Batch.countDocuments({ status: "active" }),
      ]),
    ]);
    const [totalStudents, activeStudents, totalBatches, activeBatches] =
      academicCounts;

    const lines = [];
    lines.push("IDA ERP CRM — Reports & Analytics Export");
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push("");

    lines.push("SECTION,Overview");
    lines.push(`Total Revenue (all time),${totalRevenueAgg[0]?.total || 0}`);
    lines.push("");

    lines.push("SECTION,Revenue Trends");
    lines.push("Month,Year,Income,Expense,Net");
    trends.forEach((t) => {
      const monthLabel = new Date(t._id.year, t._id.month - 1).toLocaleString(
        "en-US",
        {
          month: "short",
        },
      );
      lines.push(
        `${monthLabel},${t._id.year},${t.income || 0},${t.expense || 0},${(t.income || 0) - (t.expense || 0)}`,
      );
    });
    lines.push("");

    lines.push("SECTION,Staff by Role");
    lines.push("Role,Count");
    byRole.forEach((r) => lines.push(`${roleLabel(r._id)},${r.count}`));
    lines.push("");

    lines.push("SECTION,Category Breakdown");
    lines.push("Category,Type,Total");
    categoryBreakdown.forEach((c) =>
      lines.push(`${c._id.category},${c._id.type},${c.total}`),
    );
    lines.push("");

    lines.push("SECTION,Academic Overview");
    lines.push(`Total Students,${totalStudents}`);
    lines.push(`Active Students,${activeStudents}`);
    lines.push(`Total Batches,${totalBatches}`);
    lines.push(`Active Batches,${activeBatches}`);
    lines.push("");

    lines.push("SECTION,Students by Course");
    lines.push("Course,Student Count");
    courseDistribution.forEach((c) => lines.push(`${c._id},${c.count}`));

    const csvContent = lines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reports-analytics-${new Date().toISOString().split("T")[0]}.csv`,
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Reports export error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// ============================================================
// ACADEMIC OVERVIEW — headline KPI cards for students/batches
// ============================================================
router.get(
  "/academic-overview",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const [
        totalStudents,
        activeStudents,
        inactiveStudents,
        completedStudents,
        totalBatches,
        upcomingBatches,
        activeBatches,
        completedBatches,
        totalMaterials,
        capacityAgg,
      ] = await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: "active" }),
        Student.countDocuments({ status: "inactive" }),
        Student.countDocuments({ status: "completed" }),
        Batch.countDocuments(),
        Batch.countDocuments({ status: "upcoming" }),
        Batch.countDocuments({ status: "active" }),
        Batch.countDocuments({ status: "completed" }),
        CourseMaterial.countDocuments({ isActive: true }),
        Batch.aggregate([
          {
            $group: {
              _id: null,
              totalCapacity: { $sum: "$capacity" },
              totalFilled: { $sum: "$currentStudents" },
            },
          },
        ]),
      ]);

      const totalCapacity = capacityAgg[0]?.totalCapacity || 0;
      const totalFilled = capacityAgg[0]?.totalFilled || 0;
      const fillRate =
        totalCapacity > 0 ? Math.round((totalFilled / totalCapacity) * 100) : 0;

      res.json({
        success: true,
        data: {
          totalStudents,
          activeStudents,
          inactiveStudents,
          completedStudents,
          totalBatches,
          upcomingBatches,
          activeBatches,
          completedBatches,
          totalMaterials,
          totalCapacity,
          totalFilled,
          fillRate,
        },
      });
    } catch (error) {
      console.error("Academic overview error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

// ============================================================
// ENROLLMENT TRENDS — new student joins per month
// ============================================================
router.get(
  "/enrollment-trends",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const months = Math.min(parseInt(req.query.months) || 6, 24);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trends = await Student.aggregate([
        { $match: { joinDate: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$joinDate" },
              month: { $month: "$joinDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const formatted = trends.map((t) => ({
        month: new Date(t._id.year, t._id.month - 1).toLocaleString("en-US", {
          month: "short",
        }),
        year: t._id.year,
        enrollments: t.count,
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      console.error("Enrollment trends error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

// ============================================================
// COURSE DISTRIBUTION — student headcount by course
// ============================================================
router.get(
  "/course-distribution",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const distribution = await Student.aggregate([
        { $match: { course: { $ne: "" } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const total = distribution.reduce((sum, d) => sum + d.count, 0);
      const palette = [
        "#5fc98d",
        "#5b8def",
        "#f2b84b",
        "#9b7ede",
        "#4dd0c9",
        "#f0806c",
        "#84cc16",
        "#e879f9",
      ];

      const formatted = distribution.map((d, i) => ({
        course: d._id,
        count: d.count,
        percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
        color: palette[i % palette.length],
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      console.error("Course distribution error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

// ============================================================
// BATCH UTILIZATION — capacity vs enrolled per batch
// ============================================================
router.get(
  "/batch-utilization",
  protect,
  authorize(ALLOWED_ROLES),
  async (req, res) => {
    try {
      const { status } = req.query;
      const query = {};
      if (status) query.status = status;

      const batches = await Batch.find(query)
        .select(
          "name code course capacity currentStudents status startDate endDate",
        )
        .sort({ currentStudents: -1 })
        .limit(20)
        .lean();

      const formatted = batches.map((b) => ({
        id: b._id,
        name: b.name,
        code: b.code,
        course: b.course,
        capacity: b.capacity,
        enrolled: b.currentStudents,
        fillRate:
          b.capacity > 0
            ? Math.round((b.currentStudents / b.capacity) * 100)
            : 0,
        status: b.status,
        startDate: b.startDate,
        endDate: b.endDate,
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      console.error("Batch utilization error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  },
);

export default router;
