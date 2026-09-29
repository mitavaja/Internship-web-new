const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const InternshipBatch = require('../models/InternshipBatch');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getStudents = asyncHandler(async (req, res) => {
  const result = await applyQuery(StudentProfile, req.query, {
    searchFields: ['studentId', 'skills'],
    populate: [
      { path: 'userId', select: 'name email phone avatar isActive' },
      { path: 'internshipId', select: 'title code domain durationWeeks' },
      { path: 'batchId', select: 'title batchCode startDate endDate status' },
    ],
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Students retrieved', result.meta));
});

// @desc    Get single student profile
// @route   GET /api/v1/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res, next) => {
  const student = await StudentProfile.findById(req.params.id)
    .populate('userId', 'name email phone avatar isActive createdAt')
    .populate('internshipId')
    .populate('batchId');

  if (!student) {
    return next(ApiError.notFound('Student profile not found'));
  }

  res.status(200).json(ApiResponse.success(student));
});

// @desc    Update student profile
// @route   PUT /api/v1/students/:id
// @access  Private (SUPER_ADMIN, ADMIN, or student owner)
const updateStudentProfile = asyncHandler(async (req, res, next) => {
  let student = await StudentProfile.findById(req.params.id);
  if (!student) {
    return next(ApiError.notFound('Student profile not found'));
  }

  // Check authorization: SuperAdmin, Admin, or the student themselves
  if (
    !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role) &&
    student.userId.toString() !== req.user._id.toString()
  ) {
    return next(ApiError.forbidden('You are not authorized to update this profile'));
  }

  const allowedFields = [
    'educationalDetails',
    'skills',
    'githubProfile',
    'linkedinProfile',
    'portfolioUrl',
    'resumeUrl',
    'guardianDetails',
    'emergencyContact',
  ];

  // Only Admin/SuperAdmin can change status, batchId, internshipId
  if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    allowedFields.push('status', 'batchId', 'internshipId', 'completionDate', 'studentId');
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      student[field] = req.body[field];
    }
  });

  student.updatedBy = req.user._id;
  await student.save();

  // If batchId was updated, ensure student is added to the batch's students array
  if (req.body.batchId) {
    await InternshipBatch.findByIdAndUpdate(req.body.batchId, {
      $addToSet: { students: student.userId },
    });
  }

  const updated = await StudentProfile.findById(student._id)
    .populate('userId', 'name email phone avatar')
    .populate('internshipId')
    .populate('batchId');

  res.status(200).json(ApiResponse.success(updated, 'Profile updated successfully'));
});

// @desc    Get current student's own profile
// @route   GET /api/v1/students/me/profile
// @access  Private (STUDENT)
const getMyStudentProfile = asyncHandler(async (req, res, next) => {
  const student = await StudentProfile.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone avatar')
    .populate('internshipId')
    .populate({
      path: 'batchId',
      populate: { path: 'teachers', select: 'name email phone avatar' },
    });

  if (!student) {
    return next(ApiError.notFound('Student profile not found for this user'));
  }

  res.status(200).json(ApiResponse.success(student));
});

module.exports = {
  getStudents,
  getStudentById,
  updateStudentProfile,
  getMyStudentProfile,
};
