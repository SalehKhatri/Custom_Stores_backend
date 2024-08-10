const express = require("express");
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  addOrUpdateAddress,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to authenticate a user and get a token
router.post("/login", authUser);

// Routes to get and update the user profile
// Requires authentication
router
  .route("/profile")
  .get(protect, getUserProfile)     // Get user profile
  .put(protect, updateUserProfile); // Update user profile

// Route to add or update a user address
// Requires authentication
router.put("/address", protect, addOrUpdateAddress);

module.exports = router;
