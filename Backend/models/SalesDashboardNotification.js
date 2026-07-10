// models/SalesDashboardNotification.js
import mongoose from "mongoose";

const notifSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deal", "call", "email", "default"],
      default: "default",
    },
    title: { type: String, required: true },
    message: { type: String },
    time: { type: String, default: "Just now" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("SalesDashboardNotification", notifSchema);
