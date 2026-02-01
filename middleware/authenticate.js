const jwt = require("jsonwebtoken");
require("dotenv").config();
const logger = require("../services/logger");

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode;
    next();
  } catch (error) {
    logger.error("JWT verification error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      message: "Error in authenticating user",
    });
  }
};
