const mongoose = require('mongoose');

const syllabusModuleSchema = new mongoose.Schema(
  {
    moduleNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    durationWeeks: { type: Number, default: 1 },
    topics: [{ type: String, trim: true }],
  },
  { _id: true }
);

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Internship code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    durationWeeks: {
      type: Number,
      required: [true, 'Duration in weeks is required'],
      min: 1,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    prerequisites: [{ type: String, trim: true }],
    syllabus: [syllabusModuleSchema],
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
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

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;
