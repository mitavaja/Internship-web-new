const Meeting = require('../models/Meeting');
const StudentProfile = require('../models/StudentProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Schedule new live session / mentorship meeting
// @route   POST /api/v1/meetings
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const createMeeting = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    meetingType,
    batchId,
    attendees,
    scheduledStartTime,
    scheduledEndTime,
    meetingLink,
    platform,
  } = req.body;

  const meeting = await Meeting.create({
    title,
    description: description || '',
    meetingType: meetingType || 'Mentorship',
    batchId,
    hostId: req.user._id,
    attendees: attendees || [],
    scheduledStartTime,
    scheduledEndTime,
    meetingLink,
    platform: platform || 'GoogleMeet',
    status: 'Scheduled',
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(meeting, 'Meeting scheduled successfully'));
});

// @desc    Get meetings
// @route   GET /api/v1/meetings
// @access  Private
const getMeetings = asyncHandler(async (req, res) => {
  const baseFilter = {};

  if (req.user.role === 'STUDENT') {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile && profile.batchId) {
      baseFilter.batchId = profile.batchId;
    }
  } else if (req.user.role === 'TEACHER') {
    baseFilter.$or = [{ hostId: req.user._id }, { attendees: req.user._id }];
  }

  const result = await applyQuery(Meeting, req.query, {
    searchFields: ['title', 'description'],
    populate: [
      { path: 'batchId', select: 'title batchCode' },
      { path: 'hostId', select: 'name email avatar' },
    ],
    baseFilter,
    defaultSort: 'scheduledStartTime',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Meetings retrieved', result.meta));
});

// @desc    Update meeting status or recording
// @route   PUT /api/v1/meetings/:id
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const updateMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) {
    return next(ApiError.notFound('Meeting not found'));
  }

  const fields = ['title', 'description', 'scheduledStartTime', 'scheduledEndTime', 'meetingLink', 'status', 'recordingUrl'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      meeting[f] = req.body[f];
    }
  });

  meeting.updatedBy = req.user._id;
  await meeting.save();

  res.status(200).json(ApiResponse.success(meeting, 'Meeting updated successfully'));
});

// @desc    Delete meeting
// @route   DELETE /api/v1/meetings/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const deleteMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) {
    return next(ApiError.notFound('Meeting not found'));
  }

  await Meeting.findByIdAndDelete(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Meeting deleted successfully'));
});

module.exports = {
  createMeeting,
  getMeetings,
  updateMeeting,
  deleteMeeting,
};
