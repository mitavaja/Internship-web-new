const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maindot_ims',
  jwt: {
    secret: process.env.JWT_SECRET || 'maindot_jwt_super_secret_key_production_grade_2026_xYz',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origins: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
  },
  upload: {
    dir: path.resolve(__dirname, '../../uploads'),
    maxFileSize: 25 * 1024 * 1024, // 25 MB
  },
  company: {
    name: process.env.COMPANY_NAME || 'MAINDOT',
    email: process.env.COMPANY_EMAIL || 'maindot.tech@gmail.com',
    website: process.env.COMPANY_WEBSITE || 'https://www.maindot.tech.com',
  },
};

module.exports = config;
