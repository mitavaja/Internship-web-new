const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternshipBatch',
      default: null,
    },
    educationalDetails: {
      college: { type: String, trim: true, default: '' },
      degree: { type: String, trim: true, default: '' },
      graduationYear: { type: Number, default: null },
      cgpa: { type: String, default: '' },
    },
    skills: [{ type: String, trim: true }],
    githubProfile: { type: String, trim: true, default: '' },
    linkedinProfile: { type: String, trim: true, default: '' },
    portfolioUrl: { type: String, trim: true, default: '' },
    resumeUrl: { type: String, trim: true, default: '' },
    guardianDetails: {
      name: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    status: {
      type: String,
      enum: ['Applied', 'Enrolled', 'Active', 'OnLeave', 'Completed', 'Dropped'],
      default: 'Active',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
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

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = StudentProfile;
