const mongoose = require('mongoose');

const internshipBatchSchema = new mongoose.Schema(
  {
    batchCode: {
      type: String,
      required: [true, 'Batch code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Batch title is required'],
      trim: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    maxStudents: {
      type: Number,
      default: 50,
      min: 1,
    },
    scheduleDetails: {
      daysOfWeek: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
      timing: { type: String, default: '10:00 AM - 01:00 PM IST' },
      mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Archived'],
      default: 'Ongoing',
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

const InternshipBatch = mongoose.model('InternshipBatch', internshipBatchSchema);
module.exports = InternshipBatch;
