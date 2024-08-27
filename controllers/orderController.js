const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').populate('products.product', 'name');

  res.json(orders);
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingId } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status || order.status;
    order.trackingId = trackingId || order.trackingId;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Assign delivery partner (Admin)
// @route   PUT /api/orders/:id/delivery-partner
// @access  Private/Admin
const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { deliveryPartner } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.deliveryPartner = deliveryPartner;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

module.exports = {
  getAllOrders,
  updateOrderStatus,
  assignDeliveryPartner,
};
