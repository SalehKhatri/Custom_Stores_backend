const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { verifyToken } = require("../utils/jwtUtils");

// Middleware to protect routes that require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header with a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token and decode it
      const decoded = verifyToken(token);

      // Attach the decoded user information to the request object
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // If token verification fails, respond with unauthorized status
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is found, respond with unauthorized status
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to restrict access to admin users only
const admin = (req, res, next) => {
  // Check if the user is authenticated and has admin privileges
  
  if (req.user && req.user.isAdmin) {
    // Proceed to the next middleware or route handler
    next();
  } else {
    // If not an admin, respond with unauthorized status
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };
