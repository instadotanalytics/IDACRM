// routes/notificationRoutes.js - UPDATED WITH SOCKET.IO
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = (io) => {
  const router = express.Router();

  router.use(protect);

  // Get user notifications
  router.get("/", async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        userId: req.user.id,
        read: false,
      });

      res.json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Mark notification as read
  router.put("/:id/read", async (req, res) => {
    try {
      const notification = await Notification.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found" });
      }

      notification.read = true;
      await notification.save();

      // 🔔 EMIT SOCKET.IO EVENT
      if (io) {
        io.to(`user_${req.user.id}`).emit("notification-read", {
          notificationId: req.params.id,
          userId: req.user.id,
        });
      }

      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Mark all notifications as read
  router.put("/read-all", async (req, res) => {
    try {
      await Notification.updateMany(
        { userId: req.user.id, read: false },
        { read: true },
      );

      // 🔔 EMIT SOCKET.IO EVENT
      if (io) {
        io.to(`user_${req.user.id}`).emit("all-notifications-read", {
          userId: req.user.id,
        });
      }

      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create notification (admin only)
  router.post("/", async (req, res) => {
    try {
      const { userId, title, message, type, link } = req.body;

      const notification = await Notification.create({
        userId,
        title,
        message,
        type: type || "info",
        link,
        read: false,
        createdBy: req.user.id,
      });

      // 🔔 EMIT SOCKET.IO EVENT
      if (io) {
        io.to(`user_${userId}`).emit("new-notification", notification);
      }

      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};

export default router;
