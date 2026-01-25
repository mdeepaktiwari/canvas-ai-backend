const mongoose = require("mongoose");
const { TRANSACTION_STATUS } = require("../constant");

const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      required: [true, "User ID is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ user_id: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
