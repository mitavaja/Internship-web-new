const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get activity logs
// @route   GET /api/v1/activity-logs
// @access  Private (SUPER_ADMIN, ADMIN)
const getActivityLogs = asyncHandler(async (req, res) => {
  const result = await applyQuery(ActivityLog, req.query, {
    searchFields: ['action', 'module', 'ipAddress'],
    populate: [{ path: 'userId', select: 'name email role' }],
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Activity logs retrieved', result.meta));
});

module.exports = {
  getActivityLogs,
};
