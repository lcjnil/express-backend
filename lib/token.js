const jwt = require('jsonwebtoken');
const secret = 'SECRET!';

module.exports = {
  sign(userId) {
    return jwt.sign({ userId }, secret);
  },

  decode(token) {
    return jwt.verify(token, secret);
  }
};
