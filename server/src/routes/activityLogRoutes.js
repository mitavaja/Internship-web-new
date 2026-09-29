const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN'));

router.get('/', getActivityLogs);

module.exports = router;
