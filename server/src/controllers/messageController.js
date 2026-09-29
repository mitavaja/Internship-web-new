const Message = require('../models/Message');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Send a message
// @route   POST /api/v1/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, batchId, messageType, content, attachments } = req.body;

  if (messageType === 'Direct' && !receiverId) {
    return next(ApiError.badRequest('Receiver ID is required for direct messages'));
  }
  if (messageType === 'BatchDiscussion' && !batchId) {
    return next(ApiError.badRequest('Batch ID is required for batch discussions'));
  }

  const message = await Message.create({
    senderId: req.user._id,
    receiverId: receiverId || null,
    batchId: batchId || null,
    messageType: messageType || 'Direct',
    content,
    attachments: attachments || [],
    createdBy: req.user._id,
  });

  const populated = await Message.findById(message._id)
    .populate('senderId', 'name email avatar role')
    .populate('receiverId', 'name email avatar role');

  res.status(201).json(ApiResponse.created(populated, 'Message sent'));
});

// @desc    Get direct messages between logged in user and another user
// @route   GET /api/v1/messages/direct/:otherUserId
// @access  Private
const getDirectMessages = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;

  const messages = await Message.find({
    messageType: 'Direct',
    $or: [
      { senderId: req.user._id, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: req.user._id },
    ],
  })
    .populate('senderId', 'name email avatar role')
    .populate('receiverId', 'name email avatar role')
    .sort('createdAt');

  // Mark unread messages sent to me as read
  await Message.updateMany(
    { senderId: otherUserId, receiverId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json(ApiResponse.success(messages, 'Messages retrieved'));
});

// @desc    Get batch discussion messages
// @route   GET /api/v1/messages/batch/:batchId
// @access  Private
const getBatchMessages = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const messages = await Message.find({
    messageType: 'BatchDiscussion',
    batchId,
  })
    .populate('senderId', 'name email avatar role')
    .sort('createdAt')
    .limit(100);

  res.status(200).json(ApiResponse.success(messages, 'Batch discussion retrieved'));
});

// @desc    Get active chat contacts/conversations for logged-in user
// @route   GET /api/v1/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  // Find all distinct users the user chatted with
  const messages = await Message.find({
    messageType: 'Direct',
    $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
  })
    .sort('-createdAt')
    .populate('senderId', 'name email avatar role')
    .populate('receiverId', 'name email avatar role');

  const contactMap = new Map();

  messages.forEach((msg) => {
    const isSender = msg.senderId._id.toString() === req.user._id.toString();
    const otherUser = isSender ? msg.receiverId : msg.senderId;

    if (otherUser && !contactMap.has(otherUser._id.toString())) {
      contactMap.set(otherUser._id.toString(), {
        user: otherUser,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unread: !isSender && !msg.isRead,
      });
    }
  });

  res.status(200).json(ApiResponse.success(Array.from(contactMap.values()), 'Conversations retrieved'));
});

module.exports = {
  sendMessage,
  getDirectMessages,
  getBatchMessages,
  getConversations,
};
