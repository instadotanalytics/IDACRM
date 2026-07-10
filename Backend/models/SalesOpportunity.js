// models/SalesOpportunity.js
import mongoose from "mongoose";

const salesOpportunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String },
    stage: {
      type: String,
      enum: [
        "Prospect",
        "Assessment",
        "Proposal",
        "Contracts",
        "Closed Won",
        "Closed Lost",
      ],
      default: "Prospect",
    },
    value: { type: String },
    probability: { type: String, default: "30%" },
    closeDate: { type: String },
    rep: { type: String },
    repUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("SalesOpportunity", salesOpportunitySchema);
