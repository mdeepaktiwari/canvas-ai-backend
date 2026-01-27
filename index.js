const express = require("express");
const http = require("http");
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
const { Server } = require("socket.io");
require("dotenv").config();

// Create HTTP server and attach WebSocket
const server = http.createServer(app);

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

let io;
try {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.emit("server_status", { status: "ready" });

    socket.on("disconnect", (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} - ${reason}`);
    });
  });
} catch (error) {
  logger.error(
    "Socket.io is not installed. Install it with `npm install socket.io` if you want WebSocket support.",
  );
}

server.listen(PORT, () => {
  logger.info(`Server started on PORT ${PORT}`);

  // Broadcast a server ready event (useful for clients already connected)
  if (io) {
    io.emit("server_status", { status: "ready" });
  }
});
