const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { leaveSchema, reviewLeaveSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.post('/', authorizeRoles('STUDENT'), validate(leaveSchema), logActivity('APPLY_LEAVE', 'LEAVE'), applyLeave);
router.get('/my-leaves', authorizeRoles('STUDENT'), getMyLeaves);

router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getAllLeaves);
router.put(
  '/:id/review',
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
  validate(reviewLeaveSchema),
  logActivity('REVIEW_LEAVE', 'LEAVE'),
  reviewLeave
);

module.exports = router;
