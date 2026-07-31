// routes/salesCallsRoutes.js - For SalesCall model
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import SalesCall from "../models/SalesCall.js";

const router = (io) => {
  const router = express.Router();

  router.use(protect);

  // Create a new sales call
  router.post("/", async (req, res) => {
    try {
      const callData = {
        ...req.body,
        assignedTo: req.body.assignedTo || req.user.id,
      };

      const newCall = await SalesCall.create(callData);

      // 🔔 EMIT SOCKET.IO EVENT
      if (io) {
        io.emit("sales-call-created", {
          call: newCall,
          createdBy: req.user.name,
          timestamp: new Date(),
        });

        // Notify assigned user
        io.to(`user_${newCall.assignedTo}`).emit("sales-call-assigned", {
          call: newCall,
          message: `New call assigned to you: ${newCall.customer}`,
        });
      }

      res.status(201).json({
        success: true,
        data: newCall,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all sales calls
  router.get("/", async (req, res) => {
    try {
      const query = {};

      // Filter by assigned user
      if (
        req.user.role !== "admin_manager" &&
        req.user.role !== "super_admin"
      ) {
        query.assignedTo = req.user.id;
      }

      const calls = await SalesCall.find(query)
        .populate("assignedTo", "name email")
        .sort({ scheduledDate: -1 });

      res.json({ success: true, data: calls });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update sales call
  router.put("/:id", async (req, res) => {
    try {
      const call = await SalesCall.findById(req.params.id);

      if (!call) {
        return res
          .status(404)
          .json({ success: false, message: "Call not found" });
      }

      const oldStatus = call.status;
      const updatedCall = await SalesCall.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      ).populate("assignedTo", "name email");

      // 🔔 EMIT SOCKET.IO EVENTS
      if (io) {
        io.emit("sales-call-updated", {
          call: updatedCall,
          updatedBy: req.user.name,
          timestamp: new Date(),
        });

        // If status changed
        if (oldStatus !== updatedCall.status) {
          io.emit("sales-call-status-changed", {
            callId: req.params.id,
            oldStatus,
            newStatus: updatedCall.status,
            call: updatedCall,
            updatedBy: req.user.name,
            timestamp: new Date(),
          });
        }
      }

      res.json({ success: true, data: updatedCall });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Delete sales call
  router.delete("/:id", async (req, res) => {
    try {
      const call = await SalesCall.findById(req.params.id);

      if (!call) {
        return res
          .status(404)
          .json({ success: false, message: "Call not found" });
      }

      await call.deleteOne();

      // 🔔 EMIT SOCKET.IO EVENT
      if (io) {
        io.emit("sales-call-deleted", {
          callId: req.params.id,
          deletedBy: req.user.name,
          timestamp: new Date(),
        });
      }

      res.json({ success: true, message: "Call deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};

export default router;
