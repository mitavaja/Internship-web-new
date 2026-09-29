const express = require('express');
const router = express.Router();
const {
  markBatchAttendance,
  studentCheckIn,
  getBatchAttendance,
  getMyAttendance,
} = require('../controllers/attendanceController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { markAttendanceSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.post('/check-in', authorizeRoles('STUDENT'), studentCheckIn);
router.get('/my-attendance', authorizeRoles('STUDENT'), getMyAttendance);

router.post(
  '/batch',
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
  validate(markAttendanceSchema),
  logActivity('MARK_ATTENDANCE', 'ATTENDANCE'),
  markBatchAttendance
);

router.get(
  '/batch/:batchId',
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
  getBatchAttendance
);

module.exports = router;
