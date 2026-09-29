const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getAllCertificates,
  getMyCertificates,
  verifyCertificate,
  revokeCertificate,
} = require('../controllers/certificateController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { issueCertificateSchema } = require('../validators/schemas');
const { logActivity } = require('../middleware/auditLogger');

// Public verification route
router.get('/verify/:code', verifyCertificate);

// Protected routes
router.use(authenticate);

router.get('/my-certificates', authorizeRoles('STUDENT'), getMyCertificates);
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getAllCertificates);
router.post(
  '/issue',
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  validate(issueCertificateSchema),
  logActivity('ISSUE_CERTIFICATE', 'CERTIFICATE'),
  issueCertificate
);
router.put(
  '/:id/revoke',
  authorizeRoles('SUPER_ADMIN'),
  logActivity('REVOKE_CERTIFICATE', 'CERTIFICATE'),
  revokeCertificate
);

module.exports = router;
