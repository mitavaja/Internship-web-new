const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  updateMeeting,
  deleteMeeting,
} = require('../controllers/meetingController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { meetingSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.route('/')
  .get(getMeetings)
  .post(
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(meetingSchema),
    logActivity('SCHEDULE_MEETING', 'MEETING'),
    createMeeting
  );

router.route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), logActivity('UPDATE_MEETING', 'MEETING'), updateMeeting)
  .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_MEETING', 'MEETING'), deleteMeeting);

module.exports = router;
