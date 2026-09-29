const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'MAINDOT',
      trim: true,
    },
    companyEmail: {
      type: String,
      default: 'maindot.tech@gmail.com',
      trim: true,
    },
    companyPhone: {
      type: String,
      default: '+91 83208 18881',
      trim: true,
    },
    companyAddress: {
      type: String,
      default: '225/4 Uniq Square, Opp. Shubham K Mart & Zudio, Dabholi, Katargam, Surat 395004',
      trim: true,
    },
    website: {
      type: String,
      default: 'https://www.maindot.tech.com',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#F47B20',
    },
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    termsAndConditions: {
      type: String,
      default: 'Welcome to MAINDOT Internship. Students must maintain at least 80% attendance to qualify for internship completion certificate.',
    },
    allowStudentRegistration: {
      type: Boolean,
      default: true,
    },
    requirePaymentForEnrollment: {
      type: Boolean,
      default: false,
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      taskDueReminders: { type: Boolean, default: true },
      autoIssueCertificate: { type: Boolean, default: true },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
