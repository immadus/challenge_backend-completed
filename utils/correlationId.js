const crypto = require('crypto');

function generateCorrelationId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { generateCorrelationId };