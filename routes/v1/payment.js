const express = require("express");
const {
  createOrder,
  verifyPayment,
  getPricingPackages,
  getUserCredits,
} = require("../../controller/payment");
const { authenticate } = require("../../middleware/authenticate");
const router = express.Router();

router.get("/packages", getPricingPackages);

router.get("/credits", authenticate, getUserCredits);
router.post("/create-order", authenticate, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);

module.exports = router;
