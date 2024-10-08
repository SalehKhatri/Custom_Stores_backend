const express = require("express");
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getUserOrders,
  sendEmailOTP, 
  verifyEmailOTP,
  updateAddress
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

//Routes to verify email during registration
router.post("/send-email-otp", sendEmailOTP)
router.post("/verify-email-otp", verifyEmailOTP)

// Route to authenticate a user and get a token
router.post("/login", authUser);

// Routes to get and update the user profile
// Requires authentication
router
  .route("/profile")
  .get(protect, getUserProfile)     // Get user profile
  .put(protect, updateUserProfile); // Update user profile

// Routes to reset password
router.post("/forgot-password", forgotPassword); // User requests for reset token
router.post("/reset-password/:token", resetPassword); //Uses reset token to change password

// Route to get user's orders
router.get("/orders", protect, getUserOrders);

// Route to update a user address
// Requires authentication
router.put("/address", protect, updateAddress);

module.exports = router;
