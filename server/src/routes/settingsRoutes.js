const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { settingsSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.get('/', getSettings);
router.put(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  validate(settingsSchema),
  logActivity('UPDATE_SETTINGS', 'SETTINGS'),
  updateSettings
);

module.exports = router;
