const express = require('express');
const { createRazorpayOrder, paymentCancelled, paymentFailed, verifyPayment, razorpayWebhook, getRazopayKey } = require('../controllers/paymentController');
const {protect} = require("../middlewares/authMiddleware")
const router = express.Router();

router.post('/razorpay',protect, createRazorpayOrder);
router.post('/verify',protect, verifyPayment);
router.post('/paymentCancelled',protect, paymentCancelled);
router.post('/razorpay-webhook', razorpayWebhook);
router.post('/paymentFailed',protect, paymentFailed);
router.get('/getRazorpayKey', getRazopayKey);

module.exports = router;
