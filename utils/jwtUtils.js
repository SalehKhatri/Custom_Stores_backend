const jwt = require("jsonwebtoken");

// Generate JWT token
// @param {Object} user - The user object containing _id and isAdmin fields
// @returns {string} - The generated JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },  // Payload containing user ID and admin status
    process.env.JWT_SECRET,                    // Secret key for signing the token
    {
      expiresIn: "30d",                        // Token validity duration
    }
  );
};

// Verify JWT token
// @param {string} token - The JWT token to verify
// @returns {Object} - The decoded payload if verification is successful
// @throws {JsonWebTokenError} - Throws an error if token is invalid or expired
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key
};

module.exports = { generateToken, verifyToken };
