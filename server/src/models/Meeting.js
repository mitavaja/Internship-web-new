const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    meetingType: {
      type: String,
      enum: ['Lecture', 'Mentorship', 'Review', 'General'],
      default: 'Mentorship',
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternshipBatch',
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scheduledStartTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    scheduledEndTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting URL link is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['GoogleMeet', 'Zoom', 'Teams', 'Internal'],
      default: 'GoogleMeet',
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Live', 'Completed', 'Cancelled'],
      default: 'Scheduled',
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

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;
