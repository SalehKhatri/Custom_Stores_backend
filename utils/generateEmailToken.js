const { customAlphabet } = require("nanoid")

// Define a custom alphabet containing digits only
const digits = '0123456789';

// Create a nanoid instance that generates a 4-digit number
const generateEmailToken = customAlphabet(digits, 4);

module.exports = generateEmailToken;
