const Leave = require('../models/Leave');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Apply for leave
// @route   POST /api/v1/leaves
// @access  Private (STUDENT)
const applyLeave = asyncHandler(async (req, res, next) => {
  const { batchId, leaveType, startDate, endDate, reason, documentUrl } = req.body;

  const profile = await StudentProfile.findOne({ userId: req.user._id });
  const targetBatchId = batchId || (profile && profile.batchId);

  if (!targetBatchId) {
    return next(ApiError.badRequest('You must belong to a batch to apply for leave.'));
  }

  const leave = await Leave.create({
    studentId: req.user._id,
    batchId: targetBatchId,
    leaveType,
    startDate,
    endDate,
    reason,
    documentUrl: documentUrl || '',
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(leave, 'Leave application submitted'));
});

// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getAllLeaves = asyncHandler(async (req, res) => {
  const result = await applyQuery(Leave, req.query, {
    populate: [
      { path: 'studentId', select: 'name email phone avatar' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'reviewedBy', select: 'name' },
    ],
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Leaves retrieved', result.meta));
});

// @desc    Get my leaves (STUDENT)
// @route   GET /api/v1/leaves/my-leaves
// @access  Private (STUDENT)
const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ studentId: req.user._id })
    .populate('batchId', 'title batchCode')
    .sort('-createdAt');

  res.status(200).json(ApiResponse.success(leaves, 'My leaves retrieved'));
});

// @desc    Review leave (Approve/Reject)
// @route   PUT /api/v1/leaves/:id/review
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const reviewLeave = asyncHandler(async (req, res, next) => {
  const { status, reviewRemarks } = req.body;

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return next(ApiError.notFound('Leave request not found'));
  }

  leave.status = status;
  leave.reviewRemarks = reviewRemarks || '';
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  leave.updatedBy = req.user._id;

  await leave.save();

  // Send notification to student
  await Notification.create({
    recipientId: leave.studentId,
    title: `Leave Request ${status}`,
    message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(
      leave.endDate
    ).toLocaleDateString()} has been ${status.toLowerCase()}. ${reviewRemarks ? `Note: ${reviewRemarks}` : ''}`,
    type: 'Leave',
    link: '/leaves',
  });

  res.status(200).json(ApiResponse.success(leave, `Leave request ${status.toLowerCase()}`));
});

module.exports = {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  reviewLeave,
};
