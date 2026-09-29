const Announcement = require('../models/Announcement');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Create announcement
// @route   POST /api/v1/announcements
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, targetAudience, targetBatchId, priority, attachments, expiryDate } = req.body;

  const announcement = await Announcement.create({
    title,
    content,
    targetAudience: targetAudience || 'All',
    targetBatchId: targetBatchId || null,
    priority: priority || 'Normal',
    attachments: attachments || [],
    expiryDate: expiryDate || null,
    authorId: req.user._id,
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(announcement, 'Announcement created successfully'));
});

// @desc    Get announcements for current user
// @route   GET /api/v1/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const baseFilter = {};

  if (req.user.role === 'STUDENT') {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    baseFilter.$or = [
      { targetAudience: 'All' },
      { targetAudience: 'Students' },
      ...(profile && profile.batchId
        ? [{ targetAudience: 'SpecificBatch', targetBatchId: profile.batchId }]
        : []),
    ];
  } else if (req.user.role === 'TEACHER') {
    baseFilter.$or = [{ targetAudience: 'All' }, { targetAudience: 'Teachers' }];
  }

  const result = await applyQuery(Announcement, req.query, {
    searchFields: ['title', 'content'],
    populate: [
      { path: 'authorId', select: 'name email role avatar' },
      { path: 'targetBatchId', select: 'title batchCode' },
    ],
    baseFilter,
    defaultSort: '-publishDate',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Announcements retrieved', result.meta));
});

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    return next(ApiError.notFound('Announcement not found'));
  }

  await Announcement.findByIdAndDelete(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Announcement deleted successfully'));
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
