// controllers/adminController.js
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwtUtils");

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "adminpassword"; // You should hash this in a real scenario

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate admin credentials
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ message: "Invalid email" });
  }

  // Compare password
  if (password !== ADMIN_PASSWORD) {
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

module.exports = {
  authAdmin,
};
