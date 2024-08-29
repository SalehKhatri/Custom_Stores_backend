const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Product name is required
    },
    description: {
      type: String,
      required: true, // Product description is required
    },
    actualPrice: {
      type: String,
      required: true, // Actual price of the product is required
    },
    discountPrice: {
      type: String,
      required: true, // Discounted price of the product is required
    },
    rating: {
      type: Number,
      required: true, // Product rating is required
    },
    colors: [
      {
        name: {
          type: String,
          required: true, // Color name is required
        },
        images: [
          {
            type: String,
            required: true, // Image URLs for the color variant are required
          },
        ],
      },
    ],
    primaryImage: {
      type: String,
      required: true,
    },
    features: {
      type: String,
      required: true, // Product features are required
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true, // Product category is required
    },
    isNewArrival: {
      type: Boolean,
      default: true, // Indicates if the product is a new arrival, default is true
    },
    isFeatured: {
      type: Boolean,
      default: false, // Indicates if the product is featured, default is false
    },
    inStock: {
      type: Boolean,
      default: true, // Indicates if the product is in stock, default is true
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
