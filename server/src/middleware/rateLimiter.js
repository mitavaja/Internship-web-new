const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.badRequest('Too many requests from this IP, please try again in 15 minutes.'));
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Limit sensitive auth requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.badRequest('Too many login attempts. Please try again after 15 minutes.'));
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
