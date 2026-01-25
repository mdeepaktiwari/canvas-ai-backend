const express = require("express");
const { generateImage, history } = require("../../controller/image");
const { authenticate } = require("../../middleware/authenticate");
const router = express.Router();

router.post("/generate", authenticate, generateImage);
router.get("/history", authenticate, history);

module.exports = router;
