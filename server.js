// server.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const { logger, logInfo } = require("./config/logger");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes")
const { errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000; // Define the port to listen on, default to 5000 if not specified

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(logger); // Apply custom logger middleware
app.use(errorHandler); // Apply global error handler middleware

// Database Connection
connectDB(); // Call function to connect to the database

// Routes
app.get("/", (req, res) => {
  res.send("E-commerce API"); // Basic route for the root URL
});
app.use("/api/products", productRoutes); // Route for handling product-related requests
app.use("/api/user", userRoutes); // Route for handling user-related requests
app.use('/api/cart', cartRoutes);

// Start server
app.listen(PORT, () => {
  logInfo(`Server running on port ${PORT}`); // Log a message indicating server is running
});
