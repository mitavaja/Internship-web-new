const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternshipBatch',
      required: [true, 'Batch reference is required'],
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Evaluation title is required'],
      trim: true,
    },
    evaluationType: {
      type: String,
      enum: ['Midterm', 'Final', 'Project', 'Practical'],
      default: 'Final',
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      trim: true,
      default: 'A',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    published: {
      type: Boolean,
      default: true,
    },
    evaluatedBy: {
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

resultSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.totalMarks) * 100 * 10) / 10;
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 60) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
