// Middleware to handle errors in the application
const errorHandler = (err, req, res, next) => {
  // Determine the status code for the response
  // If the response status code is 200 (success), set it to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Set the response status code
  res.status(statusCode);

  // Send a JSON response with error details
  res.json({
    // Include the error message
    message: err.message,
    
    // Include the stack trace if not in production environment
    // This helps with debugging but is hidden in production for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
