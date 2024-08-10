const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getNewArrivals,
  getFeaturedProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../config/multerConfig");

const router = express.Router();

// Route to fetch all products
router.get("/", getProducts);

// Route to fetch featured products(up to 5)
router.get("/featured", getFeaturedProducts);

// Route to fetch new arrival products(up to 5)
router.get("/new-arrivals", getNewArrivals);

// Route to create a new product
// Requires authentication and admin privileges
// Uses multer for handling file uploads
router.post(
  "/",
  protect, // Middleware to check if the user is authenticated
  admin, // Middleware to check if the user has admin privileges
  upload.any(), // Multer configuration to handle file uploads
  createProduct // Controller function to handle the creation of the product
);

// Route to fetch a product by its ID
router.get("/:id", getProductById);

// Route to update a product by its ID
// Requires authentication and admin privileges
// Uses multer for handling file uploads
router.put(
  "/:id",
  protect, // Middleware to check if the user is authenticated
  admin, // Middleware to check if the user has admin privileges
  upload.any(), // Multer configuration to handle file uploads
  updateProduct // Controller function to handle updating the product
);

// Route to delete a product by its ID
// Requires authentication and admin privileges
router.delete(
  "/:id",
  protect, // Middleware to check if the user is authenticated
  admin, // Middleware to check if the user has admin privileges
  deleteProduct // Controller function to handle deleting the product
);

module.exports = router;
