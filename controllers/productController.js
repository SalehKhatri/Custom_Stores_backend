const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
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
  primaryImage: Joi.string().required(),
  features: Joi.string().required(),
  category: Joi.string().required(), // Category ID is required
  isNewArrival: Joi.boolean(),
  isFeatured: Joi.boolean(),
  inStock: Joi.boolean(),
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10; // Limit number of products per page
  const page = Number(req.query.page) || 1; // Current page number

  const count = await Product.countDocuments(); // Total number of products
  const products = await Product.find({})
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1)); // Skip products based on page

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize), // Total number of pages
    totalProducts: count,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("category", "name");
  res.json(products);
});

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNewArrival: true })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("category", "name");
  res.json(products);
});

// @desc    Fetch a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({
      message: "Product not found",
    });
    throw new Error("Product not found");
  }
});

// @desc    Get products by category with pagination
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const pageSize = Number(req.query.limit) || 10; // Limit number of products per page
  const page = Number(req.query.page) || 1; // Current page number

  // Find the category by name
  const categoryExists = await Category.findOne({ name: category });

  if (!categoryExists) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  // Get the total count of products in the category
  const count = await Product.countDocuments({ category: categoryExists._id });

  // Fetch the products with pagination
  const products = await Product.find({ category: categoryExists._id })
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Return the products with pagination details
  res.status(200).json({
    products,
    page,
    pages: Math.ceil(count / pageSize), // Total number of pages
    totalProducts: count, // Total number of products in the category
  });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    const files = req.files || {};
    const colorsWithImages = await Promise.all(
      req.body.colors.map(async (color, index) => {
        const colorKey = `colors[${index}]`;
        const imageFiles = files.filter((file) =>
          file.fieldname.startsWith(`${colorKey}[images]`)
        );

        const images = await Promise.all(
          imageFiles.map(async (file) => {
            const imageUrl = await uploadImageToCloudinary(file.path);
            return imageUrl;
          })
        );

        return {
          ...color,
          images,
        };
      })
    );

    req.body.colors = colorsWithImages;
    const primaryImage = colorsWithImages[0]?.images[0] || "";

    const { error, value } = productSchema.validate({
      ...req.body,
      primaryImage,
    });
    if (error) {
      res.status(400).json({
        message: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    const product = new Product({ ...value, primaryImage });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      actualPrice: Joi.string(),
      discountPrice: Joi.string(),
      rating: Joi.number(),
      primaryImage: Joi.string(),
      features: Joi.string(),
      category: Joi.string(), // Category ID can be updated
      isNewArrival: Joi.boolean(),
      isFeatured: Joi.boolean(),
      inStock: Joi.boolean(),
    }).min(1);

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
      return;
    }

    const product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, value);

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({
        message: "Product not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
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
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};
