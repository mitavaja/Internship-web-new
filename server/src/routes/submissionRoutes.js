const express = require('express');
const router = express.Router();
const {
  submitTask,
  getSubmissions,
  getSubmissionById,
  gradeSubmission,
  getMySubmissions,
  deleteSubmission,
} = require('../controllers/submissionController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { submissionSchema, gradeSubmissionSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.post('/', authorizeRoles('STUDENT'), validate(submissionSchema), logActivity('SUBMIT_TASK', 'TASK'), submitTask);
router.get('/student/my-submissions', authorizeRoles('STUDENT'), getMySubmissions);

router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getSubmissions);
router.get('/:id', getSubmissionById);
router.put(
  '/:id/grade',
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
  validate(gradeSubmissionSchema),
  logActivity('GRADE_SUBMISSION', 'TASK'),
  gradeSubmission
);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), logActivity('DELETE_SUBMISSION', 'TASK'), deleteSubmission);

module.exports = router;
