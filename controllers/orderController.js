const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Joi = require("joi");

// Validation schema for creating an order
const createOrderSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(1).required(),
      })
    )
    .required(),
  paymentId: Joi.string(),
  deliveryAddress: Joi.string().required(),
  contactNumber: Joi.string().required(),
  totalPrice: Joi.number().required(),
});

const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid("Pending", "Processing", "Shipped", "Delivered", "Canceled")
    .optional(),
  trackingId: Joi.string().optional(),
  deliveryPartner: Joi.string().optional(),
});

// Validation schema for updating order status
// @desc    Update order fields
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
  const { error } = updateOrderSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  // Update fields if provided
  const { status, trackingId, deliveryPartner } = req.body;
  if (status) order.status = status;
  if (trackingId) order.trackingId = trackingId;
  if (deliveryPartner) order.deliveryPartner = deliveryPartner;

  try {
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
});

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { error } = createOrderSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  const {
    products,
    deliveryAddress,
    contactNumber,
    paymentMethod,
    totalPrice,
  } = req.body;

  // Validate each product
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }
  }

  // Create a new order
  const order = new Order({
    user: req.user.id,
    products,
    deliveryAddress,
    contactNumber,
    paymentMethod,
    paymentId: "Pending",
    totalPrice,
  });

  try {
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("products.productId", "name")
    .sort({
      createdAt: -1, // Sort the rest of the orders by creation date in descending order
    });

  if (!orders.length) {
    return res.status(400).json({ message: "No orders found!" });
  }

  res.json(orders);
});

// @desc    Get all orders for a user
// @route   GET /api/orders/user
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });

  if (orders) {
    res.json(orders);
  } else {
    res.status(404).json({ message: "No orders found for this user" });
  }
});

// @desc    Get a single order by ID for a user
// @route   GET /api/orders/user/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("products.productId", "name");

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found or access denied" });
  }
});

module.exports = {
  createOrder,
  getAllOrders,
  updateOrder,
  getUserOrders,
  getOrderById,
};
