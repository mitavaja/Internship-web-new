const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { announcementSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.route('/')
  .get(getAnnouncements)
  .post(
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(announcementSchema),
    logActivity('CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT'),
    createAnnouncement
  );

router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT'), deleteAnnouncement);

module.exports = router;
