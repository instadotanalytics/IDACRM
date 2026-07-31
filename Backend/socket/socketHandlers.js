// socket/socketHandlers.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CallLog from "../models/CallLog.js";
import SalesCall from "../models/SalesCall.js";

// Store connected users
const connectedUsers = new Map();
const userRooms = new Map();

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    // Get user from socket data (set in auth middleware)
    const userId = socket.userId;
    const userRole = socket.userRole;

    // Store user connection
    if (userId) {
      connectedUsers.set(userId, socket.id);
      userRooms.set(socket.id, userId);

      // Join user to their personal room
      socket.join(`user_${userId}`);

      // Join role-based room
      if (userRole) {
        socket.join(`role_${userRole}`);
      }

      console.log(`👤 User ${userId} (${userRole}) connected`);

      // Broadcast user online status
      io.emit("user-online", {
        userId,
        role: userRole,
        timestamp: new Date(),
      });

      // Let the newly-connected client know who else is online right now
      // (needed so the Messages panel can show live/offline dots on load,
      // not just react to future user-online/user-offline events)
      socket.emit("online-users", {
        userIds: Array.from(connectedUsers.keys()),
      });
    }

    // ============================================
    // CALL LOG EVENTS (for CallLog model)
    // ============================================

    // Handle new call log creation
    socket.on("new-call-log-created", async (callData) => {
      try {
        console.log("📞 New call log created:", callData);

        // Broadcast to admin/managers
        io.to("role_admin_manager").emit("call-log-created", callData);
        io.to("role_super_admin").emit("call-log-created", callData);

        // Broadcast to specific counselor's team
        if (callData.counselorId) {
          io.to(`user_${callData.counselorId}`).emit(
            "call-log-created",
            callData,
          );
        }

        // Broadcast to all connected clients (excluding sender)
        socket.broadcast.emit("call-log-created", callData);
      } catch (error) {
        console.error("Error handling call log creation:", error);
        socket.emit("error", { message: "Failed to broadcast call log" });
      }
    });

    // Handle call log update
    socket.on("call-log-updated", async (data) => {
      try {
        console.log("✏️ Call log updated:", data);

        // Broadcast to admin/managers
        io.to("role_admin_manager").emit("call-log-updated", data);
        io.to("role_super_admin").emit("call-log-updated", data);

        // Broadcast to counselor who owns the call
        if (data.counselorId) {
          io.to(`user_${data.counselorId}`).emit("call-log-updated", data);
        }

        socket.broadcast.emit("call-log-updated", data);
      } catch (error) {
        console.error("Error handling call log update:", error);
        socket.emit("error", {
          message: "Failed to broadcast call log update",
        });
      }
    });

    // Handle call log deletion
    socket.on("call-log-deleted", async (data) => {
      try {
        console.log("🗑️ Call log deleted:", data);

        io.to("role_admin_manager").emit("call-log-deleted", data);
        io.to("role_super_admin").emit("call-log-deleted", data);

        if (data.counselorId) {
          io.to(`user_${data.counselorId}`).emit("call-log-deleted", data);
        }

        socket.broadcast.emit("call-log-deleted", data);
      } catch (error) {
        console.error("Error handling call log deletion:", error);
        socket.emit("error", {
          message: "Failed to broadcast call log deletion",
        });
      }
    });

    // ============================================
    // SALES CALL EVENTS (for SalesCall model)
    // ============================================

    // Handle new sales call
    socket.on("sales-call-created", async (callData) => {
      try {
        console.log("📞 New sales call created:", callData);

        // Broadcast to all connected clients
        io.emit("sales-call-created", callData);

        // Send notification to assigned user
        if (callData.assignedTo) {
          io.to(`user_${callData.assignedTo}`).emit(
            "sales-call-assigned",
            callData,
          );
        }
      } catch (error) {
        console.error("Error handling sales call creation:", error);
        socket.emit("error", { message: "Failed to broadcast sales call" });
      }
    });

    // Handle sales call update
    socket.on("sales-call-updated", async (data) => {
      try {
        console.log("✏️ Sales call updated:", data);
        io.emit("sales-call-updated", data);

        if (data.assignedTo) {
          io.to(`user_${data.assignedTo}`).emit("sales-call-updated", data);
        }
      } catch (error) {
        console.error("Error handling sales call update:", error);
        socket.emit("error", {
          message: "Failed to broadcast sales call update",
        });
      }
    });

    // Handle sales call deletion
    socket.on("sales-call-deleted", async (data) => {
      try {
        console.log("🗑️ Sales call deleted:", data);
        io.emit("sales-call-deleted", data);
      } catch (error) {
        console.error("Error handling sales call deletion:", error);
        socket.emit("error", {
          message: "Failed to broadcast sales call deletion",
        });
      }
    });

    // Handle sales call status change
    socket.on("sales-call-status-changed", async (data) => {
      try {
        console.log(
          `📊 Sales call ${data.callId} status changed to ${data.status}`,
        );
        io.emit("sales-call-status-changed", data);
      } catch (error) {
        console.error("Error handling sales call status change:", error);
        socket.emit("error", { message: "Failed to broadcast status change" });
      }
    });

    // ============================================
    // REAL-TIME STATISTICS
    // ============================================

    socket.on("request-stats", async (data) => {
      try {
        const stats = await getRealtimeStats(data.userId);
        socket.emit("stats-update", stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
        socket.emit("error", { message: "Failed to fetch statistics" });
      }
    });

    // ============================================
    // NOTIFICATION EVENTS
    // ============================================

    socket.on("notification-read", (data) => {
      // Notify others that notification was read
      io.to(`user_${data.userId}`).emit("notification-read", data);
    });

    // ============================================
    // MESSAGING EVENTS
    // ============================================
    // Sending a message itself goes through REST (POST /api/messages), which
    // creates the Message document and emits 'new-message' directly — same
    // pattern as notificationRoutes.js. The only thing that needs a live
    // socket.on handler here is the typing indicator, which never touches
    // the database and has to be instant.
    //
    // NOTE: these replace the old broadcast-to-everyone typing handlers
    // (which fired 'user-typing' to ALL connected clients regardless of who
    // they were chatting with). Now targeted to just the receiver.

    socket.on("typing", ({ receiverId }) => {
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("typing", { senderId: userId });
      }
    });

    socket.on("stop-typing", ({ receiverId }) => {
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("stop-typing", { senderId: userId });
      }
    });

    // ============================================
    // DISCONNECTION HANDLING
    // ============================================

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);

      if (userId) {
        connectedUsers.delete(userId);
        userRooms.delete(socket.id);

        // Broadcast user offline status
        io.emit("user-offline", {
          userId,
          timestamp: new Date(),
        });

        console.log(`👤 User ${userId} disconnected`);
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      console.log(`🔄 Client reconnected: ${socket.id}`);

      if (userId) {
        connectedUsers.set(userId, socket.id);
        io.emit("user-online", {
          userId,
          role: userRole,
          timestamp: new Date(),
        });
      }
    });
  });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get real-time statistics
const getRealtimeStats = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's call stats
    const todayCalls = await CallLog.find({
      counselorId: userId,
      callTime: { $gte: today, $lt: tomorrow },
    });

    const totalCalls = await CallLog.countDocuments({ counselorId: userId });

    return {
      today: {
        total: todayCalls.length,
        connected: todayCalls.filter((c) => c.callStatus === "Connected")
          .length,
        notAnswered: todayCalls.filter((c) => c.callStatus === "Not Answered")
          .length,
      },
      total: totalCalls,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return null;
  }
};

// Utility function to emit to specific users
export const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

// Utility function to emit to role
export const emitToRole = (io, role, event, data) => {
  io.to(`role_${role}`).emit(event, data);
};

// Utility function to get online users
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

export { connectedUsers, userRooms };
