const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Joi = require("joi");
const { uploadImageToCloudinary } = require("../utils/cloudinaryUtils");


// Validation schema for product
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  actualPrice: Joi.string().required(),
  discountPrice: Joi.string().required(),
  rating: Joi.number().required(),
  colors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      images: Joi.array().items(Joi.string().required()).required(),
    })
  ),
  features: Joi.string().required(),
  category: Joi.string().required(), // Category is required
  isNewArrival: Joi.boolean(),
  isFeatured: Joi.boolean(),
  inStock: Joi.boolean(),
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Fetch all products from the database
  const products = await Product.find({});
  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).sort({ updatedAt: -1 }).limit(5);
  res.json(products);
});

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNewArrival: true }).sort({ updatedAt: -1 }).limit(5);
  res.json(products);
});


// @desc    Fetch a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // Fetch a single product from the database by ID
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    // Process files to associate with colors
    const files = req.files || {};
    const colorsWithImages = await Promise.all(req.body.colors.map(async (color, index) => {
      const colorKey = `colors[${index}]`;
      const imageFiles = files.filter(file => file.fieldname.startsWith(`${colorKey}[images]`));

      const images = await Promise.all(imageFiles.map(async (file) => {
        const imageUrl = await uploadImageToCloudinary(file.path);
        return imageUrl;
      }));

      return {
        ...color,
        images,
      };
    }));

    // Replace the colors in req.body with the colors including image URLs
    req.body.colors = colorsWithImages;

    // Validate the modified req.body with Joi
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    // Create and save the product
    const product = new Product(value);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message,
    });
  }
});

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  try {
    // Process files to associate with colors
    const files = req.files || {};
    const colorsWithImages = await Promise.all(req.body.colors.map(async (color, index) => {
      const colorKey = `colors[${index}]`;
      const imageFiles = files.filter(file => file.fieldname.startsWith(`${colorKey}[images]`));

      const images = await Promise.all(imageFiles.map(async (file) => {
        const imageUrl = await uploadImageToCloudinary(file.path);
        return imageUrl;
      }));

      return {
        ...color,
        images,
      };
    }));

    // Replace the colors in req.body with the colors including image URLs
    req.body.colors = colorsWithImages;

    // Validate the modified req.body with Joi
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    // Find the product by ID and update it
    const product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, value);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }

  } catch (error) {
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message,
    });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  // Find the product by ID and delete it
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
