const express = require('express');
const router = express.Router();
const {
  createResult,
  getResults,
  getMyResults,
  updateResult,
  deleteResult,
} = require('../controllers/resultController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { resultSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.get('/my-results', authorizeRoles('STUDENT'), getMyResults);

router.route('/')
  .get(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getResults)
  .post(
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(resultSchema),
    logActivity('PUBLISH_RESULT', 'RESULT'),
    createResult
  );

router.route('/:id')
  .put(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), logActivity('UPDATE_RESULT', 'RESULT'), updateResult)
  .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_RESULT', 'RESULT'), deleteResult);

module.exports = router;
