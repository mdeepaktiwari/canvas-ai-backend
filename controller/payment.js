const crypto = require("crypto");
const User = require("../models/auth");
const Transaction = require("../models/transaction");
const { CREDIT_PACKAGES, HTTP_STATUS } = require("../constant");
const razorpayInstance = require("../config/razorpay");
const {
  sendError,
  sendSuccess,
  asyncHandler,
} = require("../services/response");
const logger = require("../services/logger");
require("dotenv").config();

exports.getPricingPackages = asyncHandler(async (req, res) => {
  logger.info("Fetching pricing packages");
  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Pricing packages fetched successfully",
    {
      packages: CREDIT_PACKAGES,
    },
  );
});

exports.getUserCredits = asyncHandler(async (req, res) => {
  logger.info(`Fetching credits for user ${req.user.id}`);
  const user = await User.findById(req.user.id).select("credits");

  if (!user) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, "User not found");
  }

  return sendSuccess(res, HTTP_STATUS.OK, "Credits fetched successfully", {
    credits: user.credits,
  });
});

exports.createOrder = asyncHandler(async (req, res) => {
  logger.info(`Creating Razorpay order for user ${req.user.id}`);
  const { packageId } = req.body;

  if (!packageId) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Package ID is required");
  }

  const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);

  if (!selectedPackage) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Invalid package ID");
  }

  const amount = selectedPackage.price * 100; // Convert to paise
  const currency = "INR";

  const options = {
    amount: amount,
    currency: currency,
    receipt: `${req.user.id}_${Date.now()}`,
    notes: {
      userId: req.user.id.toString(),
      packageId: packageId,
      credits: selectedPackage.credits,
    },
  };

  try {
        console.log(options)
    const order = await razorpayInstance.orders.create(options);

    await Transaction.create({
      user_id: req.user.id,
      razorpay_order_id: order.id,
      amount: selectedPackage.price,
      credits: selectedPackage.credits,
      status: "pending",
    });

    return sendSuccess(res, HTTP_STATUS.CREATED, "Order created successfully", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      package: selectedPackage,
    });
  } catch (error) {
    console.log(error)
    logger.error(`Error creating Razorpay order: ${error.message}`);
    return sendError(
      res,
      HTTP_STATUS.INTERVAL_SERVER_ERROR,
      "Failed to create order",
    );
  }
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  logger.info(`Verifying payment for user ${req.user.id}`);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Payment verification details are required",
    );
  }

  const transaction = await Transaction.findOne({
    razorpay_order_id,
    user_id: req.user.id,
  });

  if (!transaction) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, "Transaction not found");
  }

  if (transaction.status === "completed") {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Payment already processed");
  }

  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    transaction.status = "failed";
    await transaction.save();

    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Invalid payment signature");
  }

  // Payment verified - add credits to user
  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, "User not found");
  }

  // Update transaction
  transaction.razorpay_payment_id = razorpay_payment_id;
  transaction.razorpay_signature = razorpay_signature;
  transaction.status = "completed";
  await transaction.save();

  // Add credits to user
  user.credits += transaction.credits;
  await user.save();

  logger.info(
    `Payment verified successfully. Added ${transaction.credits} credits to user ${req.user.id}`,
  );

  return sendSuccess(res, HTTP_STATUS.OK, "Payment verified successfully", {
    credits: user.credits,
    creditsAdded: transaction.credits,
  });
});
