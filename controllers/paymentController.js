const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const razorpay = require("../config/razorpayConfig");
const crypto = require("crypto");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { sendOrderConfirmationEmail } = require("../utils/mailer");
const Cart = require("../models/cartModel");

// @desc    Create a Razorpay order
// @route   POST /api/payments/razorpay
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { products, deliveryAddress, contactNumber, totalPrice } = req.body;

  // Validate products
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }
  }

  // Create a new order in the database
  const order = new Order({
    user: req.user.id,
    products,

    deliveryAddress,
    contactNumber,
    paymentMethod: "Razorpay", // Set payment method to Razorpay
    paymentId: "Pending",
    razorpayOrderId: "Pending",
    paymentStatus: "Pending",
    totalPrice,
  });

  const createdOrder = await order.save();

  // Prepare Razorpay order options
  const options = {
    amount: totalPrice * 100, // Amount in paise (1 INR = 100 paise)
    currency: "INR",
    receipt: `receipt_${new Date().getTime()}`,
  };

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(options);

    // Update the order with Razorpay order ID
    createdOrder.razorpayOrderId = razorpayOrder.id;
    await createdOrder.save();

    // Respond with Razorpay order details and created order
    res.json({ razorpayOrder, createdOrder });
  } catch (error) {
    // If Razorpay order creation fails, delete the created order
    await createdOrder.remove();
    res.status(500).json({ message: "Error creating Razorpay order", error });
  }
});

// @desc    Verify Razorpay payment and create a payment record
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartId } =
    req.body;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order) {
        await order.remove(); // Delete the order on payment failure
      }
      return res
        .status(400)
        .json({ message: "Invalid signature, order deleted" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentId = razorpay_payment_id;
    order.paymentStatus = "Completed";

    await order.save();
    // Clear the cart items if cartId is passed
    if (cartId) {
      await Cart.findByIdAndUpdate(cartId, { $set: { cartItems: [] } });
    }

    const user = await User.findById(order.user);

    if (user) {
      await sendOrderConfirmationEmail(user.email, order);
    }
    res.status(200).json({ message: "Payment verified successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error verifying payment", error });
  }
});

const getRazopayKey = asyncHandler(async (req, res) => {
  const razorpayKey = process.env.RAZORPAY_TEST_KEY_ID;
  if (razorpayKey) {
    return res.status(200).json(razorpayKey); // Corrected here
  } else {
    return res.status(404).json({ message: "No key found!" });
  }
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getRazopayKey,
};
