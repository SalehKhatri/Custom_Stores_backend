const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Joi = require("joi");

// Validation schema for adding to cart
const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});

// Validation schema for updating cart item quantity
const updateCartItemSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { error } = addToCartSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const productPrice = parseFloat(product.discountPrice);

  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    const existingItem = cart.cartItems.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalCost = existingItem.quantity * productPrice;
    } else {
      cart.cartItems.push({
        productId: product._id,
        name: product.name,
        price: productPrice,
        quantity,
        totalCost: productPrice * quantity,
      });
    }

    cart.totalCartCost = cart.cartItems.reduce((acc, item) => acc + item.totalCost, 0);

    await cart.save();
    res.status(200).json(cart);
  } else {
    const newCart = await Cart.create({
      user: req.user.id,
      cartItems: [
        {
          productId: product._id,
          name: product.name,
          price: productPrice,
          quantity,
          totalCost: productPrice * quantity,
        },
      ],
      totalCartCost: productPrice * quantity,
    });

    res.status(201).json(newCart);
  }
});

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: "Cart not found" });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { error } = updateCartItemSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    const item = cart.cartItems.find(item => item.productId.toString() === productId);

    if (item) {
      const product = await Product.findById(productId);
      const productPrice = parseFloat(product.discountPrice);

      item.quantity = quantity;
      item.price = productPrice;
      item.totalCost = item.quantity * item.price;

      cart.totalCartCost = cart.cartItems.reduce((acc, item) => acc + item.totalCost, 0);

      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } else {
    res.status(404).json({ message: "Cart not found" });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    const item = cart.cartItems.find(item => item.productId.toString() === productId);

    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        item.totalCost = item.quantity * item.price;
      } else {
        cart.cartItems = cart.cartItems.filter(item => item.productId.toString() !== productId);
      }

      cart.totalCartCost = cart.cartItems.reduce((acc, item) => acc + item.totalCost, 0);

      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } else {
    res.status(404).json({ message: "Cart not found" });
  }
});


// @desc    Clear the cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    cart.cartItems = [];
    cart.totalCartCost = 0;

    await cart.save();
    res.json({ message: "Cart cleared" });
  } else {
    res.status(404).json({ message: "Cart not found" });
  }
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
