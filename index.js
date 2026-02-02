const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const numWorkers = process.env.NUM_WORKERS
    ? parseInt(process.env.NUM_WORKERS)
    : Math.min(numCPUs, 4); // Default to max 4 workers

  console.log(`Master process ${process.pid} is running`);
  console.log(`Starting ${numWorkers} workers...`);

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

  process.on("SIGTERM", () => {
    console.log("Master received SIGTERM, shutting down workers...");
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });
} else {
  // Worker processes run the Express app
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
  const { createAdapter } = require("@socket.io/redis-adapter");
  const { createClient } = require("redis");
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
      worker: process.pid,
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

    // Setup Redis adapter for Socket.io clustering
    const setupSocketAdapter = async () => {
      try {
        const pubClient = createClient({
          url: process.env.REDIS_URL,
        });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        io.adapter(createAdapter(pubClient, subClient));
        logger.info("Socket.io Redis adapter configured");
      } catch (error) {
        logger.error(`Failed to setup Socket.io Redis adapter: ${error}`);
      }
    };

    setupSocketAdapter();

    io.on("connection", (socket) => {
      logger.info(
        `WebSocket client connected: ${socket.id} on worker ${process.pid}`,
      );

      socket.emit("server_status", { status: "ready", worker: process.pid });

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
    logger.info(`Worker ${process.pid} started on PORT ${PORT}`);

    // Broadcast a server ready event
    if (io) {
      io.emit("server_status", { status: "ready", worker: process.pid });
    }
  });

  process.on("SIGTERM", () => {
    logger.info(
      `Worker ${process.pid} received SIGTERM, shutting down gracefully...`,
    );
    server.close(() => {
      logger.info(`Worker ${process.pid} closed`);
      process.exit(0);
    });
  });
}
