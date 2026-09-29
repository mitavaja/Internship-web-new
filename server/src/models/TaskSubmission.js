const mongoose = require('mongoose');

const taskSubmissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternshipBatch',
      required: true,
    },
    submissionFiles: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        fileType: { type: String, trim: true },
        size: { type: Number, default: 0 },
      },
    ],
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Reviewed', 'Late', 'Resubmitted'],
      default: 'Submitted',
    },
    score: {
      type: Number,
      default: null,
      min: 0,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    feedback: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
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

// Unique compound index so a student submits once per task (unless resubmitting updates the same record)
taskSubmissionSchema.index({ taskId: 1, studentId: 1 }, { unique: true });

const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);
module.exports = TaskSubmission;
