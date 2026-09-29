const express = require('express');
const router = express.Router();
const {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
} = require('../controllers/internshipController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { internshipSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

router.get('/', getInternships);
router.get('/:id', getInternshipById);

router.post(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  validate(internshipSchema),
  logActivity('CREATE_INTERNSHIP', 'INTERNSHIP'),
  createInternship
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  logActivity('UPDATE_INTERNSHIP', 'INTERNSHIP'),
  updateInternship
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  logActivity('DELETE_INTERNSHIP', 'INTERNSHIP'),
  deleteInternship
);

module.exports = router;
