// models/SalesEvent.js
import mongoose from "mongoose";

const salesEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String },
    type: {
      type: String,
      enum: ["meeting", "call", "important", "followup"],
      default: "meeting",
    },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("SalesEvent", salesEventSchema);
