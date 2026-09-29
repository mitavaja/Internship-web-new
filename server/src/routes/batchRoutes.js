const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  enrollStudents,
  deleteBatch,
} = require('../controllers/batchController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { batchSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.route('/')
  .get(getBatches)
  .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(batchSchema), logActivity('CREATE_BATCH', 'BATCH'), createBatch);

router.route('/:id')
  .get(getBatchById)
  .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('UPDATE_BATCH', 'BATCH'), updateBatch)
  .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_BATCH', 'BATCH'), deleteBatch);

router.post('/:id/enroll', authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('ENROLL_STUDENTS', 'BATCH'), enrollStudents);

module.exports = router;
