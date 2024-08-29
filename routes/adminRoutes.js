// routes/adminRoutes.js
const express = require("express");
const {
  authAdmin,
  getAdminProfile,
} = require("../controllers/adminController");
const { admin, protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// Route for admin login
router.post("/login", authAdmin);
router.get("/profile", protect, admin, getAdminProfile);

module.exports = router;
