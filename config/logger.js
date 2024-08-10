
// Function to format log messages
const formatLogMessage = (level, message) => {
  const formattedTime = new Date().toLocaleString();
  return `[Custom-Stores - ${formattedTime}] ${level}: ${message}`;
};

// Function to log custom messages
const logCustomMessage = (level, message) => {
  const logMessage = formatLogMessage(level, message);
  
  // Color the log messages based on level and reset color for the actual message
  const color = level === 'info' ? '\x1b[32m' : level === 'error' ? '\x1b[31m' : '\x1b[0m';
  console.log(`${color}[Custom-Stores - ${new Date().toLocaleString()}] ${level}:\x1b[0m \x1b[37m${message}\x1b[0m`);
};

// Middleware function for request logging
const logger = (req, res, next) => {
  const logMessage = `[Custom-Stores - ${new Date().toLocaleString()}] info:`;
  const routeMessage = `Route Enabled: ${req.method} ${req.originalUrl}`;

  console.log(`\x1b[32m${logMessage}\x1b[0m \x1b[37m${routeMessage}\x1b[0m`);

  next();
};

// Export custom logging functions
const logInfo = (message) => logCustomMessage('info', message);
const logError = (message) => logCustomMessage('error', message);

module.exports = { logger, logInfo, logError };
