// routes/messageRoutes.js - Real-time chat, mirrors notificationRoutes.js pattern
import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = (io) => {
  const router = express.Router();

  router.use(protect);

  // ─── GET /api/messages/conversations ─────────────────────────────
  // List every person the current user has exchanged messages with,
  // each with their last message + how many are unread.
  router.get("/conversations", async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);

      const conversations = await Message.aggregate([
        { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
            },
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$receiver", userId] },
                      { $eq: ["$read", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { "lastMessage.createdAt": -1 } },
      ]);

      const populated = await User.populate(conversations, {
        path: "_id",
        select: "name email role avatar",
      });

      const data = populated
        .filter((c) => c._id) // drop conversations whose partner user was deleted
        .map((c) => ({
          user: c._id,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount,
        }));

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── GET /api/messages/users/list ─────────────────────────────────
  // Everyone the current user is allowed to start a new chat with.
  router.get("/users/list", async (req, res) => {
    try {
      const users = await User.find({
        _id: { $ne: req.user.id },
        isActive: true,
      })
        .select("name email role avatar")
        .sort({ name: 1 });

      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── GET /api/messages/:userId ─────────────────────────────────────
  // Full thread between the current user and :userId
  router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const messages = await Message.find({
        $or: [
          { sender: req.user.id, receiver: userId },
          { sender: userId, receiver: req.user.id },
        ],
      })
        .sort({ createdAt: 1 })
        .limit(300)
        .populate("sender", "name email role avatar");

      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── POST /api/messages ────────────────────────────────────────────
  // Send a message
  router.post("/", async (req, res) => {
    try {
      const { receiverId, text } = req.body;

      if (!receiverId || !text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: "receiverId and text are required",
        });
      }

      const message = await Message.create({
        sender: req.user.id,
        receiver: receiverId,
        text: text.trim(),
      });

      const populatedMessage = await message.populate(
        "sender",
        "name email role avatar",
      );

      // 🔔 EMIT SOCKET.IO EVENT — deliver to the receiver in real time,
      // and echo back to the sender's other open tabs/devices.
      if (io) {
        io.to(`user_${receiverId}`).emit("new-message", populatedMessage);
        io.to(`user_${req.user.id}`).emit("new-message", populatedMessage);
      }

      res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── PUT /api/messages/:id/read ────────────────────────────────────
  router.put("/:id/read", async (req, res) => {
    try {
      const message = await Message.findOne({
        _id: req.params.id,
        receiver: req.user.id,
      });

      if (!message) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found" });
      }

      message.read = true;
      message.readAt = new Date();
      await message.save();

      if (io) {
        io.to(`user_${message.sender}`).emit("message-read", {
          messageId: message._id,
          readBy: req.user.id,
        });
      }

      res.json({ success: true, data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── PUT /api/messages/read-all/:userId ────────────────────────────
  // Mark every message from :userId to the current user as read
  router.put("/read-all/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      await Message.updateMany(
        { sender: userId, receiver: req.user.id, read: false },
        { read: true, readAt: new Date() },
      );

      if (io) {
        io.to(`user_${userId}`).emit("message-read", {
          readBy: req.user.id,
          conversationWith: userId,
          all: true,
        });
      }

      res.json({ success: true, message: "All messages marked as read" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};

export default router;
