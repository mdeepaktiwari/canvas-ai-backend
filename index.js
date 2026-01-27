const express = require("express");
const cors = require("cors");
const router = require("./routes/v1");
const app = express();
const validateEnvVariables = require("./config/env");
const database = require("./config/database");
const { connectRedis } = require("./config/redis");
const { configureCloudinary } = require("./config/cloudinary");
const logger = require("./services/logger");
const errorHandler = require("./middleware/errorHandler");
const globalLimiter = require("./middleware/rateLimiter");
const { sendError } = require("./services/response");
const { HTTP_STATUS } = require("./constant");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

try {
  validateEnvVariables();
} catch (error) {
  logger.error(error.message);
}

database().catch((error) => {
  logger.error(`Failed to connect to the database: ${error.message}`);
});

connectRedis().catch((error) => {
  logger.error(`Failed to connect to the redis: ${error.message}`);
});

configureCloudinary();

app.use(cors());
// parse json
app.use(express.json());

app.use(globalLimiter);

app.use("/v1", router);

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CanvasAI API",
    version: "1.0.0",
    status: "API is running",
  });
});

// 404 handler - should be after all routes
app.use((req, res) => {
  return sendError(res, HTTP_STATUS.NOT_FOUND, "Route not found");
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server started on PORT ${PORT}`);
});
