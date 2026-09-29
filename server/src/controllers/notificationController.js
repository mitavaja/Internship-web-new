const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipientId: req.user._id,
    isRead: false,
  });

  res.status(200).json(ApiResponse.success({ unreadCount, notifications }));
});

// @desc    Mark single notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return next(ApiError.notFound('Notification not found'));
  }

  res.status(200).json(ApiResponse.success(notification, 'Notification marked as read'));
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json(ApiResponse.success(null, 'All notifications marked as read'));
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
