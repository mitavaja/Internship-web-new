const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: [true, 'Certificate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternshipBatch',
      required: [true, 'Batch reference is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      required: [true, 'Completion date is required'],
    },
    grade: {
      type: String,
      default: 'A',
    },
    verificationCode: {
      type: String,
      unique: true,
      required: true,
    },
    verificationUrl: {
      type: String,
      default: '',
    },
    templateData: {
      studentName: { type: String, default: '' },
      internshipTitle: { type: String, default: '' },
      batchCode: { type: String, default: '' },
      directorSignature: { type: String, default: 'MAINDOT Academic Directorate' },
    },
    status: {
      type: String,
      enum: ['Draft', 'Issued', 'Revoked'],
      default: 'Issued',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
