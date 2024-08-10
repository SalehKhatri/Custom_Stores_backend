const mongoose = require('mongoose');
const { logInfo, logError } = require('./logger');

const connectDB = async () => {
  try {
    logInfo("Connecting to database")
    await mongoose.connect(process.env.MONGO_URI);
    logInfo("----------------------------------")
    logInfo("Connected to database successfully")
    logInfo("----------------------------------")
  } catch (err) {
    logError("Error connecting to database");
    process.exit(1);
  }
};

module.exports = connectDB;
