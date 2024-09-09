const asyncHandler = require("express-async-handler");
const { verifyToken, generateToken } = require("../utils/jwtUtils");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Load admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Hashed password

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate admin email
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ message: "Invalid email" });
  }

  // Compare the provided password with the hashed password
  const isPasswordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate token
  const token = generateToken({ email: ADMIN_EMAIL, isAdmin: true });

  res.json({
    email: ADMIN_EMAIL,
    isAdmin: true,
    token,
  });
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    // Verify token from request headers
    const token = req.headers.authorization?.split(" ")[1]; // Assumes Bearer token format
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Return admin profile information
    res.json({
      email: ADMIN_EMAIL,
      isAdmin: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  authAdmin,
  getAdminProfile,
};
