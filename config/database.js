const mongoose = require("mongoose");
require("dotenv").config();
const logger = require("../services/logger");

async function database() {
  if (mongoose.connection.readyState === 1) {
    logger.warn("Already connected to database, disconnecting first");
    await mongoose.disconnect();
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    const databaseName = mongoose.connection.db.databaseName;
    logger.info(`Database connected successfully to ${databaseName}`);
  } catch (error) {
    logger.error(`Error in connecting to the database: ${error.message}`);
    throw error;
  }
}

module.exports = database;
