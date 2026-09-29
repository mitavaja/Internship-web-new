const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  updateStudentProfile,
  getMyStudentProfile,
} = require('../controllers/studentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.get('/me/profile', authorizeRoles('STUDENT'), getMyStudentProfile);
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStudents);
router.get('/:id', getStudentById);
router.put('/:id', logActivity('UPDATE_STUDENT_PROFILE', 'STUDENT'), updateStudentProfile);

module.exports = router;
