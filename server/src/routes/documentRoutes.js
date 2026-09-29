const express = require('express');
const router = express.Router();
const {
  createDocument,
  getDocuments,
  deleteDocument,
} = require('../controllers/documentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const upload = require('../config/multer');
const { logActivity } = require('../middleware/auditLogger');

router.use(authenticate);

router.route('/')
  .get(getDocuments)
  .post(
    authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    upload.single('file'),
    logActivity('UPLOAD_DOCUMENT', 'DOCUMENT'),
    createDocument
  );

router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), logActivity('DELETE_DOCUMENT', 'DOCUMENT'), deleteDocument);

module.exports = router;
