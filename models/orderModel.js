const mongoose = require("mongoose");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const orderSchema = mongoose.Schema(
  {
    customOrderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        color: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Canceled",
        "Completed",
      ],
      default: "Pending",
    },
    trackingId: { type: String, default: "Pending" },
    deliveryPartner: { type: String, default: "Pending" },
    paymentMethod: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Cancelled"],
      default: "Pending",
    },
    paymentId: {
      type: String,
      default: "Pending",
    },
    razorpayOrderId: {
      // Add this field
      type: String,
      required: true,
    },
    totalPrice: { type: Number, required: true },
    deliveryAddress: addressSchema,
    contactNumber: {
      type: String,
      required: true,
    },
    orderNotes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Pre-save middleware to generate custom order ID
orderSchema.pre("validate", function (next) {
  
  if (this.isNew) {
    // Generate a unique order ID
    this.customOrderId = `ORD-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
