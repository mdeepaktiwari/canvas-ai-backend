const logger = require("../services/logger");
const { sendError } = require("../services/response");
const { HTTP_STATUS } = require("../constant");

const errorHandler = (err, req, res, next) => {
  logger.error("Error: ", err.message);

  const message = err.message || "Internal server error";
  const statusCode = err.statusCode || HTTP_STATUS.INTERVAL_SERVER_ERROR;

  return sendError(res, statusCode, message, err);
};

module.exports = errorHandler;
