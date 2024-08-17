const crypto = require('crypto');

const generateResetToken = () => {
  return crypto.randomBytes(4).toString('hex');
};

module.exports = generateResetToken
