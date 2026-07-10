// models/SalesLead.js
import mongoose from "mongoose";

const salesLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Closed Won",
        "Closed Lost",
      ],
      default: "New",
    },
    source: {
      type: String,
      enum: ["Website", "Referral", "LinkedIn", "Email", "Event", "Cold Call"],
      default: "Website",
    },
    assignedTo: { type: String },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    value: { type: String },
    probability: { type: String, default: "30%" },
    notes: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("SalesLead", salesLeadSchema);
