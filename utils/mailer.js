const nodemailer = require('nodemailer');

const sendResetEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or your email provider
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: 'Password Reset Request',
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
    service: 'Gmail', // or your email provider
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: 'Email Verification',
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
    service: 'Gmail', // or your email provider
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject: 'Welcome to Our Store!',
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

module.exports = { sendResetEmail, sendVerificationEmail, sendWelcomeEmail };
