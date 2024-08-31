const nodemailer = require("nodemailer");
const Order = require("../models/orderModel");

const sendResetEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or your email provider
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555;">Hi there,</p>
        <p style="color: #555;">
          We received a request to reset your password. Please click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${link}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or your email provider
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: "Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="color: #555;">Hi there,</p>
        <p style="color: #555;">
          Thanks for signing up! Please use the following code to verify your email address:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; border-radius: 5px; font-size: 18px;">${token}</span>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">If you did not sign up for this account, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (to, name) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or your email provider
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: "Welcome to Our Store!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to Our Store, ${name}!</h2>
        <p style="color: #555;">Hi ${name},</p>
        <p style="color: #555;">
          We're thrilled to have you on board. Explore our store and find products that match your taste. If you have any questions, feel free to reach out to us.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://yourstore.com" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Start Shopping</a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">We're here to help you have a great shopping experience.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderConfirmationEmail = async (to, order) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Populate the product names and primary images
  const populatedOrder = await Order.findById(order._id)
    .populate({
      path: "products.productId",
      select: "name primaryImage",
    })
    .exec();

  const productList = populatedOrder.products
    .map(
      (product) => `
    <li style="margin-bottom: 15px; display: flex; align-items: flex-start; padding: 10px; border-bottom: 1px solid #eee;">
      <img src="${product.productId.primaryImage}" alt="${product.productId.name}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 5px;">
      <div style="flex: 1;">
        <strong style="font-size: 16px; color: #333;">${product.productId.name}</strong><br>
        <span style="font-size: 14px; color: #555;">Quantity: ${product.quantity}</span><br>
        <span style="font-size: 14px; color: #555;">Color: ${product.color}</span><br>
        <span style="font-size: 14px; color: #555;">Price: ₹${product.price}</span>
      </div>
    </li>
  `
    )
    .join("");

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: "Order Confirmation - Your Order is Confirmed!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Order Confirmation</h2>
        <p style="color: #555; text-align: center; margin-bottom: 20px;">
          Thank you for your purchase! Your order has been confirmed and will be shipped soon. Below are the details of your order:
        </p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #555; margin-bottom: 10px;">
            <strong>Order ID:</strong> ${populatedOrder.customOrderId}<br>
            <strong>Payment ID:</strong> ${populatedOrder.paymentId}
          </p>
        </div>
        <ul style="color: #555; list-style-type: none; padding: 0;">
          ${productList}
        </ul>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #555; margin-bottom: 10px;">
            <strong>Total Price:</strong> ₹${populatedOrder.totalPrice}
          </p>
          <p style="color: #555;">
            <strong>Delivery Address:</strong><br>
            ${populatedOrder.deliveryAddress.street}, ${populatedOrder.deliveryAddress.city},<br>
            ${populatedOrder.deliveryAddress.state}, ${populatedOrder.deliveryAddress.zipCode}, ${populatedOrder.deliveryAddress.country}
          </p>
        </div>
        <p style="color: #555; margin-bottom: 20px;">
          We will notify you once your order is shipped. If you have any questions, feel free to contact us.
        </p>
        <p style="color: #999; font-size: 12px; text-align: center;">Thank you for shopping with us!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
};
