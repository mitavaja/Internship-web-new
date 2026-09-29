const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./environment');

// Ensure upload directories exist
const uploadDir = config.upload.dir;
const subDirs = ['avatars', 'documents', 'submissions', 'certificates'];

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

subDirs.forEach((sub) => {
  const p = path.join(uploadDir, sub);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'documents';
    if (file.fieldname === 'avatar') {
      folder = 'avatars';
    } else if (file.fieldname === 'submission' || file.fieldname === 'files') {
      folder = 'submissions';
    } else if (file.fieldname === 'certificate') {
      folder = 'certificates';
    }
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|pdf|doc|docx|zip|tar|gz|txt|csv|xlsx/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not allowed for security reasons.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter,
});

module.exports = upload;
