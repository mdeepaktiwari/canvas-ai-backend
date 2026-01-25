const express = require("express");
const {
  generateContent,
  history,
  contentWithId,
  searchContent,
} = require("../../controller/content");
const { authenticate } = require("../../middleware/authenticate");
const router = express.Router();

router.post("/:action", authenticate, generateContent);
router.get("/history", authenticate, history);
router.get("/search", authenticate, searchContent);
router.get("/:id", authenticate, contentWithId);

module.exports = router;
