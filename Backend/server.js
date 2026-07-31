// server.js - UPDATED WITH SOCKET.IO + MESSAGING
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import courseMaterialRoutes from "./routes/courseMaterialRoutes.js";
import studentPerformanceRoutes from "./routes/studentPerformanceRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import placementDriveRoutes from "./routes/placementDriveRoutes.js";
import hrStudentRoutes from "./routes/hrStudentsroutes.js";
import hrInterviewRoutes from "./routes/hrInterviewroutes.js";
import hrDailyReportRoutes from "./routes/hrReportroutes.js";
import salesDashboardRoutes from "./routes/salesDashboardRoutes.js";
import { setupSocketHandlers } from "./socket/socketHandlers.js";
import { protectSocket } from "./middleware/socketAuthMiddleware.js";
import revenueRoutes from "./routes/revenue.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();

const app = express();
const server = createServer(app);

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// Store socket.io instance globally
app.set("io", io);

// ============================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ============================================
io.use(protectSocket);

// ============================================
// SOCKET.IO EVENT HANDLERS
// ============================================
setupSocketHandlers(io);

// ============================================
// CONNECT DATABASE
// ============================================
await connectDB();

// ============================================
// EXPRESS MIDDLEWARE
// ============================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES - Passing io to routes
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/calls", callRoutes(io)); // Passing io to call routes
app.use("/api/notifications", notificationRoutes(io)); // Passing io to notification routes
app.use("/api/messages", messageRoutes(io)); // Passing io to message routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api/student-performance", studentPerformanceRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/course-materials", courseMaterialRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/placement-drives", placementDriveRoutes);
app.use("/api/hr-students", hrStudentRoutes);
app.use("/api/hr-interviews", hrInterviewRoutes);
app.use("/api/hr-daily-reports", hrDailyReportRoutes);
app.use("/api/sales", salesDashboardRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/reports", reportRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running with Socket.IO",
    timestamp: new Date().toISOString(),
    socketConnected: io.engine.clientsCount > 0,
    activeConnections: io.engine.clientsCount,
  });
});

// ============================================
// ERROR HANDLERS
// ============================================
app.use((err, req, res, next) => {
  console.error("🔴 GLOBAL ERROR:", err);
  console.error("🔴 GLOBAL ERROR MESSAGE:", err.message);
  console.error("🔴 GLOBAL ERROR STACK:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`🚀 SERVER STARTED SUCCESSFULLY!`);
  console.log(`🚀 ========================================`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Socket.IO Server is running`);
  console.log(`📡 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(
    `👑 Super Admin API: http://localhost:${PORT}/api/super-admin/login`,
  );
  console.log(`🚀 ========================================\n`);
});

// Export io for use in other files
export { io, server };
