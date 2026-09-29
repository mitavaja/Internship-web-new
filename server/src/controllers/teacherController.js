const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get all teachers
// @route   GET /api/v1/teachers
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getTeachers = asyncHandler(async (req, res) => {
  const result = await applyQuery(TeacherProfile, req.query, {
    searchFields: ['employeeId', 'designation', 'department', 'specialization'],
    populate: [
      { path: 'userId', select: 'name email phone avatar isActive' },
      { path: 'assignedBatches', select: 'title batchCode startDate endDate status' },
    ],
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Teachers retrieved', result.meta));
});

// @desc    Get teacher by id
// @route   GET /api/v1/teachers/:id
// @access  Private
const getTeacherById = asyncHandler(async (req, res, next) => {
  const teacher = await TeacherProfile.findById(req.params.id)
    .populate('userId', 'name email phone avatar isActive')
    .populate('assignedBatches');

  if (!teacher) {
    return next(ApiError.notFound('Teacher profile not found'));
  }

  res.status(200).json(ApiResponse.success(teacher));
});

// @desc    Update teacher profile
// @route   PUT /api/v1/teachers/:id
// @access  Private (SUPER_ADMIN, ADMIN, or teacher owner)
const updateTeacherProfile = asyncHandler(async (req, res, next) => {
  let teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) {
    return next(ApiError.notFound('Teacher profile not found'));
  }

  if (
    !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) &&
    teacher.userId.toString() !== req.user._id.toString()
  ) {
    return next(ApiError.forbidden('You are not authorized to update this profile'));
  }

  const allowedFields = ['designation', 'department', 'specialization', 'bio'];
  if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    allowedFields.push('assignedBatches', 'employeeId');
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      teacher[field] = req.body[field];
    }
  });

  teacher.updatedBy = req.user._id;
  await teacher.save();

  const updated = await TeacherProfile.findById(teacher._id)
    .populate('userId', 'name email phone avatar')
    .populate('assignedBatches');

  res.status(200).json(ApiResponse.success(updated, 'Profile updated successfully'));
});

// @desc    Get current teacher's own profile
// @route   GET /api/v1/teachers/me/profile
// @access  Private (TEACHER)
const getMyTeacherProfile = asyncHandler(async (req, res, next) => {
  const teacher = await TeacherProfile.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone avatar')
    .populate({
      path: 'assignedBatches',
      populate: { path: 'internshipId', select: 'title code' },
    });

  if (!teacher) {
    return next(ApiError.notFound('Teacher profile not found for this user'));
  }

  res.status(200).json(ApiResponse.success(teacher));
});

module.exports = {
  getTeachers,
  getTeacherById,
  updateTeacherProfile,
  getMyTeacherProfile,
};
