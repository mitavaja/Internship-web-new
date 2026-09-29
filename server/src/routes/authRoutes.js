const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updatePasswordSchema } = require('../validators/schemas');
const { authLimiter } = require('../middleware/rateLimiter');
const { logActivity } = require('../middleware/auditLogger');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), logActivity('USER_LOGIN', 'AUTH'), login);
router.get('/me', authenticate, getMe);
router.put('/update-password', authenticate, validate(updatePasswordSchema), logActivity('PASSWORD_UPDATE', 'AUTH'), updatePassword);
router.put('/profile', authenticate, logActivity('PROFILE_UPDATE', 'USER'), updateProfile);

module.exports = router;
