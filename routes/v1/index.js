const express = require("express");
const authRouter = require("./auth");
const imageRouter = require("./image");
const contentRouter = require("./content");
const paymentRouter = require("./payment");
const router = express.Router();

router.use("/auth", authRouter);
router.use("/image", imageRouter);
router.use("/content", contentRouter);
router.use("/payment", paymentRouter);

module.exports = router;
