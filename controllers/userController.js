const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { generateToken } = require("../utils/jwtUtils");
const { sendResetEmail } = require('../utils/mailer');
const generateResetToken = require('../utils/generateResetToken');
const Order = require('../models/orderModel');

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

// Validation schema for address
const addressSchema = Joi.object({
  street: Joi.string().required(), // Street address
  city: Joi.string().required(), // City
  state: Joi.string().required(), // State
  zipCode: Joi.string().required(), // Zip code
  country: Joi.string().required(), // Country
  isDefault: Joi.boolean(), // Whether the address is default
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
  const user = await User.findById(req.user.id);

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
  const user = await User.findById(req.user.id);

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

// @desc    Request a password reset link
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  const { error } = Joi.string().email().required().validate(email);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token
  const resetToken = generateResetToken();

  // Save reset token to user
  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email with reset link
  const resetLink = `http://localhost:5000/api/user/reset-password/${resetToken}`;
  // Use a service like Nodemailer to send the email
  await sendResetEmail(user.email, resetLink);

  res.json({ message: 'Password reset email sent' });
});

// @desc    Reset the password
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params; // Extract token from URL parameters
  const { newPassword } = req.body;

  // Validate new password
  const { error } = Joi.string().min(6).required().validate(newPassword);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Find user by reset token
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Hash new password and update user
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  res.json({ message: 'Password has been reset' });
});


// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  // Find orders for the authenticated user
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

  if (orders && orders.length) {
    res.json(orders);
  } else {
    res.status(404).json({ message: "No orders found" });
  }
});


// @desc    Add or update user address
// @route   PUT /api/users/address
// @access  Private
const addOrUpdateAddress = asyncHandler(async (req, res) => {
  // Validate address data with Joi
  const { error, value } = addressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Find the user by ID from authenticated user's ID
  const user = await User.findById(req.user.id);

  if (user) {
    const existingAddressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === value._id
    );

    if (existingAddressIndex > -1) {
      // Update existing address
      user.addresses[existingAddressIndex] = value;
    } else {
      // Add new address
      user.addresses.push(value);
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
  forgotPassword,
  resetPassword,
  getUserOrders,
  addOrUpdateAddress,
};
