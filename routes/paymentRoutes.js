const express = require('express');
const { createRazorpayOrder, verifyPayment, getRazopayKey } = require('../controllers/paymentController');
const {protect} = require("../middlewares/authMiddleware")
const router = express.Router();

router.post('/razorpay',protect, createRazorpayOrder);
router.post('/verify',protect, verifyPayment);
router.get('/getRazorpayKey', getRazopayKey);

module.exports = router;
