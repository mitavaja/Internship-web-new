const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { authenticate } = require('../middleware/auth');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

router.use(authenticate);

// Single file upload
router.post('/single', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return next(ApiError.badRequest('Please upload a file.'));
  }

  let subfolder = 'documents';
  if (req.file.fieldname === 'avatar') subfolder = 'avatars';
  if (req.file.fieldname === 'submission' || req.file.fieldname === 'files') subfolder = 'submissions';

  const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;

  res.status(200).json(
    ApiResponse.success(
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
      'File uploaded successfully'
    )
  );
});

module.exports = router;
