// models/Transaction.js
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "course_fee",
        "placement_fee",
        "trainer_salary",
        "operational",
        "marketing",
        "infrastructure",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online", "bank_transfer", "upi"],
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "refunded"],
      default: "pending",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ reference: 1 });

// ✅ FIX: Mongoose 7+ no longer passes a `next` callback into pre/post
// hooks — middleware just runs synchronously (or you return/await a
// promise for async work). The old `function (next) { ... next(); }`
// pattern throws "TypeError: next is not a function" because `next`
// is undefined in Mongoose 7+. Just drop the parameter and the call.
TransactionSchema.pre("save", function () {
  if (!this.reference) {
    const prefix = this.type === "income" ? "INV" : "EXP";
    const year = new Date().getFullYear();
    const count = Math.floor(Math.random() * 10000);
    this.reference = `${prefix}-${year}-${String(count).padStart(4, "0")}`;
  }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
