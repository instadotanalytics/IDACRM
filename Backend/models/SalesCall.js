// models/SalesCall.js
import mongoose from "mongoose";

const salesCallSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    time: { type: String },
    type: {
      type: String,
      enum: ["New Lead", "Follow-up", "Demo", "Closure", "Support"],
      default: "New Lead",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed"],
      default: "pending",
    },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("SalesCall", salesCallSchema);
