const Category = require("../models/categoryModel");
const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const { uploadImageToCloudinary } = require("../utils/cloudinaryUtils");

// Joi validation schema
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have a minimum length of 3",
    "string.max": "Name should have a maximum length of 50",
  }),
  image: Joi.string().required(1, "Image Is Required!"),
});

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if(!req.file){
      return res.status(400).json({ error: "Image is required" })
  }
  try {
    // Handle image upload using Cloudinary

    const imageUrl = await uploadImageToCloudinary(req.file.path);

    // Validate the request body using Joi with the uploaded image URL
    const { error } = categorySchema.validate({ name, image: imageUrl });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newCategory = new Category({ name, image: imageUrl });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category already exists" });
    }
    console.log(err);
    
    res.status(500).json({ error: "Server error" });
  }
});

// Update a category by ID
const updateCategory = asyncHandler(async (req, res) => {
  try {
    // Define the Joi schema for validating updates
    const updateSchema = Joi.object({
      name: Joi.string(),
      image: Joi.string(), // Assuming image URL can be provided directly or after upload
    }) // At least one field is required

    // Validate the request body
    const { error, value } = updateSchema.validate(req.body);

    if (error) {
      console.log(error);

      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }

    // Check if there's a new image file and upload it
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.path);
    }

    // Find the category by ID
    const category = await Category.findById(req.params.id);
    console.log(category);

    if (category) {
      // Update only the fields that are present in the request body
      const updatedData = { ...value, image: imageUrl || category.image };
      Object.assign(category, updatedData);
      // Save the updated category
      const updatedCategory = await category.save();
      return res.json(updatedCategory);
    } else {
      return res.status(404).json({
        message: "Category not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({});
    if (!categories.length) {
      return res.status(404).json({
        message: "No categories found",
      });
    }
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Server error" });
  }
});

// Delete a category by ID
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
};
