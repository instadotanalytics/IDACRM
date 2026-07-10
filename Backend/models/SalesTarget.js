// models/SalesTarget.js
import mongoose from "mongoose";

const salesTargetSchema = new mongoose.Schema(
  {
    metric: { type: String, required: true },
    target: { type: String, required: true },
    achieved: { type: String, default: "0" },
    percentage: { type: Number, default: 0 },
    rep: { type: String, default: "Team Total" },
    repUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    period: {
      type: String,
      enum: ["Weekly", "Monthly", "Quarterly", "Yearly"],
      default: "Monthly",
    },
    periodDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("SalesTarget", salesTargetSchema);
