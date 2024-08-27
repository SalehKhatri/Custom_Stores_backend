// routes/adminRoutes.js
const express = require('express');
const { authAdmin } = require('../controllers/adminController');

const router = express.Router();

// Route for admin login
router.post('/login', authAdmin);

module.exports = router;
