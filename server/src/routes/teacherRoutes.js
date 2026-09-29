const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  updateTeacherProfile,
  getMyTeacherProfile,
} = require('../controllers/teacherController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.get('/me/profile', authorizeRoles('TEACHER'), getMyTeacherProfile);
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), logActivity('UPDATE_TEACHER_PROFILE', 'TEACHER'), updateTeacherProfile);

module.exports = router;
