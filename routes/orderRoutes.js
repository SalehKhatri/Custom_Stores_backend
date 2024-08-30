const express = require("express");
const {
  createOrder,
  getAllOrders,
  updateOrder,
  getUserOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, admin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to create a new order
// Requires authentication
router.post(
  "/",
  protect, // Middleware to check if the user is authenticated
  createOrder // Controller function to handle creating a new order
);

// Route to fetch all orders (Admin)
// Requires authentication and admin privileges
router.get(
  "/",
  protect, // Middleware to check if the user is authenticated
  admin, // Middleware to check if the user has admin privileges
  getAllOrders // Controller function to handle fetching all orders
);

router.put("/:id", protect, admin, updateOrder);

// Route to get all orders for a user
// Requires authentication
router.get(
  "/user",
  protect, // Middleware to check if the user is authenticated
  getUserOrders // Controller function to handle fetching all orders for the user
);

// Route to get a single order by ID for a user
// Requires authentication
router.get(
  "/:id",
  protect, // Middleware to check if the user is authenticated
  admin,
  getOrderById // Controller function to handle fetching a single order by ID for the user
);

module.exports = router;
