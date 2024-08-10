const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { generateToken } = require("../utils/jwtUtils");

// Validation schema for user registration and login
const registerSchema = Joi.object({
  name: Joi.string().required(), // User's name
  email: Joi.string().email().required(), // User's email (must be valid email format)
  password: Joi.string().min(6).required(), // User's password (must be at least 6 characters long)
  isAdmin: Joi.boolean(), // Optional field to designate if user is an admin
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(), // User's email (must be valid email format)
  password: Joi.string().min(6).required(), // User's password (must be at least 6 characters long)
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // Validate registration data with Joi
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: value.email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the user's password before saving
  const hashedPassword = await bcrypt.hash(value.password, 10);

  // Create a new user
  const user = await User.create({
    name: value.name,
    email: value.email,
    password: hashedPassword,
    isAdmin: value.isAdmin || false,
  });

  // Respond with user data and token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  // Validate login data with Joi
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Find user by email
  const user = await User.findOne({ email: value.email });

  // Compare password with hashed password
  if (user && (await bcrypt.compare(value.password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Fetch user profile using authenticated user's ID
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // Find the user by ID from authenticated user's ID
  const user = await User.findById(req.user._id);

  if (user) {
    // Update user details
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    // Save updated user and respond
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Add or update user address
// @route   PUT /api/users/address
// @access  Private
const addOrUpdateAddress = asyncHandler(async (req, res) => {
  // Find the user by ID from authenticated user's ID
  const user = await User.findById(req.user._id);

  if (user) {
    const address = req.body.address;
    const existingAddressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === address._id
    );

    if (existingAddressIndex > -1) {
      // Update existing address
      user.addresses[existingAddressIndex] = address;
    } else {
      // Add new address
      user.addresses.push(address);
    }

    // Save updated user and respond with updated addresses
    const updatedUser = await user.save();
    res.json(updatedUser.addresses);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  addOrUpdateAddress,
};
