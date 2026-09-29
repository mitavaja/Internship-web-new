const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Technical Mentor',
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    specialization: [{ type: String, trim: true }],
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    assignedBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipBatch',
      },
    ],
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

const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
module.exports = TeacherProfile;
