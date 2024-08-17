const nodemailer = require('nodemailer');

const sendResetEmail = async (to, link) => {
  console.log(process.env.GMAIL_APP_PASSWORD);
  
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
    text: `Click the following link to reset your password: ${link}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {sendResetEmail}
