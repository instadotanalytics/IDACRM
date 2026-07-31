// routes/revenue.js - COMPLETE FIXED VERSION (v2 - hardened create/update)
import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper function for colors
function getColorForMethod(method) {
  const colors = {
    online: "#5fc98d",
    bank_transfer: "#5b8def",
    cash: "#f2b84b",
    upi: "#9b7ede",
  };
  return colors[method] || "#94a3b8";
}

// ✅ NEW: only keep a value if it's a valid ObjectId, otherwise null.
// This prevents CastError crashes (500s) when the frontend sends "" for
// an unselected student/course/trainer instead of omitting the field.
function toObjectIdOrNull(value) {
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return value;
}

// ✅ NEW: only populate a path if that model is actually registered with
// Mongoose. Prevents "MissingSchemaError: Schema hasn't been registered
// for model X" from crashing the request with a 500 if Student/Course
// models don't exist yet in this project.
function safePopulate(query, path, select) {
  const ref = Transaction.schema.path(path)?.options?.ref;
  if (ref && mongoose.modelNames().includes(ref)) {
    return query.populate(path, select);
  }
  return query;
}

// ============================================================
// TEST AUTH ENDPOINT - For debugging
// ============================================================
router.get("/test-auth", protect, async (req, res) => {
  try {
    console.log("🧪 Test auth endpoint called");
    console.log("User:", req.user);

    res.json({
      success: true,
      message: "Authentication working!",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        isActive: req.user.isActive,
      },
    });
  } catch (error) {
    console.error("Test auth error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// DASHBOARD - Get overview statistics
// ============================================================
router.get(
  "/dashboard",
  protect,
  authorize([
    "super_admin",
    "admin_manager",
    "sales_executive",
    "hr_executive",
  ]),
  async (req, res) => {
    try {
      console.log(
        "📊 Revenue dashboard accessed by:",
        req.user?.role,
        req.user?.email,
      );

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Check if there are any transactions
      const transactionCount = await Transaction.countDocuments();
      console.log("📊 Total transactions in DB:", transactionCount);

      // Aggregations
      const [
        totalRevenue,
        monthlyRevenue,
        pendingAmount,
        totalTransactions,
        successRate,
        avgTransaction,
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
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.aggregate([
          { $match: { type: "income", status: "pending" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.countDocuments(),
        Transaction.aggregate([
          { $match: { type: "income" } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
          { $match: { type: "income", status: "completed" } },
          { $group: { _id: null, avg: { $avg: "$amount" } } },
        ]),
      ]);

      // Calculate success rate
      const completed =
        successRate.find((s) => s._id === "completed")?.count || 0;
      const total = successRate.reduce((sum, s) => sum + s.count, 0);
      const successRateValue = total > 0 ? (completed / total) * 100 : 0;

      // Get recent transactions
      let recentTransactionsQuery = Transaction.find()
        .sort({ date: -1 })
        .limit(10);
      recentTransactionsQuery = safePopulate(
        recentTransactionsQuery,
        "studentId",
        "name",
      );
      recentTransactionsQuery = safePopulate(
        recentTransactionsQuery,
        "courseId",
        "name",
      );
      recentTransactionsQuery = safePopulate(
        recentTransactionsQuery,
        "trainerId",
        "name",
      );
      recentTransactionsQuery = safePopulate(
        recentTransactionsQuery,
        "createdBy",
        "name",
      );
      const recentTransactions = await recentTransactionsQuery.lean();

      // Get payment sources distribution
      const paymentSources = await Transaction.aggregate([
        { $match: { type: "income", status: "completed" } },
        { $group: { _id: "$paymentMethod", total: { $sum: "$amount" } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
            sources: { $push: { method: "$_id", amount: "$total" } },
          },
        },
      ]);

      // Get monthly trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTrends = await Transaction.aggregate([
        {
          $match: {
            date: { $gte: sixMonthsAgo },
            status: "completed",
          },
        },
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
      ]);

      const formattedTrends = monthlyTrends.map((t) => ({
        month: new Date(t._id.year, t._id.month - 1).toLocaleString("en-US", {
          month: "short",
        }),
        income: t.income || 0,
        expense: t.expense || 0,
      }));

      // Prepare recent activity
      const recentActivity = recentTransactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        time: t.date ? new Date(t.date).toLocaleString() : "N/A",
        status: t.status,
      }));

      // Format transactions for frontend
      const formattedTransactions = recentTransactions.map((t) => ({
        id: t._id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        paymentMethod: t.paymentMethod,
        status: t.status,
        date: t.date,
        reference: t.reference,
        studentName: t.studentId?.name,
        courseName: t.courseId?.name,
      }));

      const response = {
        success: true,
        data: {
          overview: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalRevenueFormatted: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(totalRevenue[0]?.total || 0),
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            monthlyRevenueFormatted: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(monthlyRevenue[0]?.total || 0),
            pendingAmount: pendingAmount[0]?.total || 0,
            pendingAmountFormatted: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(pendingAmount[0]?.total || 0),
            totalTransactions: totalTransactions,
            successRate: Math.round(successRateValue * 10) / 10,
            averageTransaction: avgTransaction[0]?.avg || 0,
            averageTransactionFormatted: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(avgTransaction[0]?.avg || 0),
          },
          transactions: formattedTransactions,
          paymentSources:
            paymentSources[0]?.sources.map((s) => ({
              name: s.method,
              value: Math.round((s.amount / paymentSources[0].total) * 100),
              color: getColorForMethod(s.method),
            })) || [],
          monthlyTrend: formattedTrends.slice(-6),
          recentActivity: recentActivity.slice(0, 5),
        },
      };

      console.log("✅ Revenue data sent successfully");
      res.json(response);
    } catch (error) {
      console.error("❌ Revenue dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// GET ALL TRANSACTIONS with filters
// ============================================================
router.get(
  "/transactions",
  protect,
  authorize([
    "super_admin",
    "admin_manager",
    "sales_executive",
    "hr_executive",
  ]),
  async (req, res) => {
    try {
      const {
        type,
        status,
        category,
        paymentMethod,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 20,
        sortBy = "date",
        sortOrder = "desc",
      } = req.query;

      const query = {};

      if (type) query.type = type;
      if (status) query.status = status;
      if (category) query.category = category;
      if (paymentMethod) query.paymentMethod = paymentMethod;

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate + "T23:59:59");
      }

      if (search) {
        query.$or = [
          { description: { $regex: search, $options: "i" } },
          { reference: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

      let transactionsQuery = Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));
      transactionsQuery = safePopulate(
        transactionsQuery,
        "studentId",
        "name email",
      );
      transactionsQuery = safePopulate(transactionsQuery, "courseId", "name");
      transactionsQuery = safePopulate(transactionsQuery, "trainerId", "name");
      transactionsQuery = safePopulate(transactionsQuery, "createdBy", "name");

      const [transactions, total] = await Promise.all([
        transactionsQuery.lean(),
        Transaction.countDocuments(query),
      ]);

      // Format transactions for frontend
      const formattedTransactions = transactions.map((t) => ({
        id: t._id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        paymentMethod: t.paymentMethod,
        status: t.status,
        date: t.date,
        reference: t.reference,
        studentId: t.studentId?._id,
        studentName: t.studentId?.name,
        courseId: t.courseId?._id,
        courseName: t.courseId?.name,
        trainerName: t.trainerId?.name,
        notes: t.notes,
        createdBy: t.createdBy?.name,
      }));

      res.json({
        success: true,
        data: {
          transactions: formattedTransactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get transactions error:", error);
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
// CREATE TRANSACTION
// ============================================================
router.post(
  "/transactions",
  protect,
  authorize(["super_admin", "admin_manager"]),
  async (req, res) => {
    try {
      const {
        type,
        category,
        amount,
        description,
        paymentMethod,
        status,
        date,
        reference,
        studentId,
        courseId,
        notes,
      } = req.body;

      // Validate required fields
      if (!type || !category || !amount || !description || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const parsedAmount = parseFloat(amount);
      if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid positive number",
        });
      }

      const transaction = new Transaction({
        type,
        category,
        amount: parsedAmount,
        description,
        paymentMethod,
        status: status || "pending",
        date: date || new Date(),
        reference: reference ? reference.trim() : undefined,
        // ✅ FIX: was `studentId || null` — an empty string "" is falsy so
        // this already worked for POST, but toObjectIdOrNull also guards
        // against garbage/invalid ids being sent, which used to CastError.
        studentId: toObjectIdOrNull(studentId),
        courseId: toObjectIdOrNull(courseId),
        notes: notes || "",
        createdBy: req.user._id,
      });

      await transaction.save();

      // Populate the created transaction (guarded — won't crash if
      // Student/Course models aren't registered in this project)
      let populatedQuery = Transaction.findById(transaction._id);
      populatedQuery = safePopulate(populatedQuery, "studentId", "name");
      populatedQuery = safePopulate(populatedQuery, "courseId", "name");
      populatedQuery = safePopulate(populatedQuery, "createdBy", "name");
      const populatedTransaction = await populatedQuery.lean();

      res.status(201).json({
        success: true,
        data: populatedTransaction,
        message: "Transaction created successfully",
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Reference number already exists",
        });
      }
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// UPDATE TRANSACTION
// ============================================================
router.put(
  "/transactions/:id",
  protect,
  authorize(["super_admin", "admin_manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid transaction id" });
      }

      const updates = { ...req.body };

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.createdAt;
      delete updates.__v;
      delete updates.createdBy;

      // ✅ FIX: the edit form sends "" for an unselected student/course
      // instead of omitting the field. Mongoose then tries to cast ""
      // to an ObjectId and throws a CastError -> 500. Sanitize here.
      if ("studentId" in updates)
        updates.studentId = toObjectIdOrNull(updates.studentId);
      if ("courseId" in updates)
        updates.courseId = toObjectIdOrNull(updates.courseId);
      if ("trainerId" in updates)
        updates.trainerId = toObjectIdOrNull(updates.trainerId);

      if (updates.amount !== undefined) {
        const parsedAmount = parseFloat(updates.amount);
        if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
          return res.status(400).json({
            success: false,
            message: "Amount must be a valid positive number",
          });
        }
        updates.amount = parsedAmount;
      }

      let updateQuery = Transaction.findByIdAndUpdate(
        id,
        { ...updates, updatedBy: req.user._id },
        { new: true, runValidators: true },
      );
      updateQuery = safePopulate(updateQuery, "studentId", "name");
      updateQuery = safePopulate(updateQuery, "courseId", "name");
      updateQuery = safePopulate(updateQuery, "createdBy", "name");
      updateQuery = safePopulate(updateQuery, "updatedBy", "name");
      const transaction = await updateQuery.lean();

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.json({
        success: true,
        data: transaction,
        message: "Transaction updated successfully",
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Reference number already exists",
        });
      }
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// DELETE TRANSACTION
// ============================================================
router.delete(
  "/transactions/:id",
  protect,
  authorize(["super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid transaction id" });
      }

      const transaction = await Transaction.findByIdAndDelete(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// EXPORT DATA
// ============================================================
router.get(
  "/export",
  protect,
  authorize([
    "super_admin",
    "admin_manager",
    "sales_executive",
    "hr_executive",
  ]),
  async (req, res) => {
    try {
      const { startDate, endDate, type, status } = req.query;

      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate + "T23:59:59");
      }

      let exportQuery = Transaction.find(query).sort({ date: -1 });
      exportQuery = safePopulate(exportQuery, "studentId", "name");
      exportQuery = safePopulate(exportQuery, "courseId", "name");
      const transactions = await exportQuery.lean();

      // Format for export
      const exportData = transactions.map((t) => ({
        Date: t.date ? new Date(t.date).toLocaleDateString("en-IN") : "N/A",
        Reference: t.reference || "N/A",
        Description: t.description,
        Category: t.category,
        Type: t.type,
        Amount: t.amount,
        "Payment Method": t.paymentMethod,
        Status: t.status,
        "Student Name": t.studentId?.name || "N/A",
        "Course Name": t.courseId?.name || "N/A",
      }));

      // ✅ FIX: previously returned a 404 when there were no matching
      // transactions. That made the frontend log a scary "API Error: 404"
      // for a perfectly normal case (empty date range / no data yet).
      // Return a valid CSV with just the header row instead — no error,
      // the user just gets a file with headers and no rows.
      const header = [
        "Date",
        "Reference",
        "Description",
        "Category",
        "Type",
        "Amount",
        "Payment Method",
        "Status",
        "Student Name",
        "Course Name",
      ];
      const csvRows = [
        header.join(","),
        ...exportData.map((row) =>
          header.map((field) => `"${row[field] || ""}"`).join(","),
        ),
      ];
      const csvContent = csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=revenue-data-${new Date().toISOString().split("T")[0]}.csv`,
      );
      res.send(csvContent);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// SUMMARY
// ============================================================
router.get(
  "/summary",
  protect,
  authorize(["super_admin", "admin_manager"]),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {};
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate + "T23:59:59");
      }

      const summary = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
            average: { $avg: "$amount" },
            max: { $max: "$amount" },
            min: { $min: "$amount" },
          },
        },
      ]);

      const result = {};
      summary.forEach((s) => {
        result[s._id] = {
          total: s.total,
          count: s.count,
          average: s.average,
          max: s.max,
          min: s.min,
        };
      });

      res.json({
        success: true,
        data: {
          income: result.income || {
            total: 0,
            count: 0,
            average: 0,
            max: 0,
            min: 0,
          },
          expense: result.expense || {
            total: 0,
            count: 0,
            average: 0,
            max: 0,
            min: 0,
          },
        },
      });
    } catch (error) {
      console.error("Summary error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// PAYMENT SOURCES
// ============================================================
router.get(
  "/payment-sources",
  protect,
  authorize(["super_admin", "admin_manager"]),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = { type: "income", status: "completed" };
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate + "T23:59:59");
      }

      const sources = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const total = sources.reduce((sum, s) => sum + s.total, 0);
      const formattedSources = sources.map((s) => ({
        name: s._id,
        amount: s.total,
        count: s.count,
        percentage: total > 0 ? Math.round((s.total / total) * 100) : 0,
        color: getColorForMethod(s._id),
      }));

      res.json({
        success: true,
        data: formattedSources,
      });
    } catch (error) {
      console.error("Payment sources error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// ============================================================
// MONTHLY TRENDS
// ============================================================
router.get(
  "/monthly-trends",
  protect,
  authorize(["super_admin", "admin_manager"]),
  async (req, res) => {
    try {
      const { months = 6 } = req.query;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));

      const trends = await Transaction.aggregate([
        {
          $match: {
            date: { $gte: startDate },
            status: "completed",
          },
        },
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
      ]);

      const formattedTrends = trends.map((t) => ({
        month: new Date(t._id.year, t._id.month - 1).toLocaleString("en-US", {
          month: "short",
        }),
        income: t.income || 0,
        expense: t.expense || 0,
        year: t._id.year,
      }));

      res.json({
        success: true,
        data: formattedTrends,
      });
    } catch (error) {
      console.error("Monthly trends error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

export default router;
