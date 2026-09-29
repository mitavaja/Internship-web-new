const InternshipBatch = require('../models/InternshipBatch');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get all batches
// @route   GET /api/v1/batches
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getBatches = asyncHandler(async (req, res) => {
  // If teacher, can optionally filter to their assigned batches
  const baseFilter = {};
  if (req.user.role === 'TEACHER') {
    baseFilter.teachers = req.user._id;
  }

  const result = await applyQuery(InternshipBatch, req.query, {
    searchFields: ['title', 'batchCode'],
    populate: [
      { path: 'internshipId', select: 'title code durationWeeks level domain' },
      { path: 'teachers', select: 'name email phone avatar' },
    ],
    baseFilter,
    defaultSort: '-startDate',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Batches retrieved', result.meta));
});

// @desc    Get single batch with all details & students list
// @route   GET /api/v1/batches/:id
// @access  Private
const getBatchById = asyncHandler(async (req, res, next) => {
  const batch = await InternshipBatch.findById(req.params.id)
    .populate('internshipId')
    .populate('teachers', 'name email phone avatar')
    .populate('students', 'name email phone avatar');

  if (!batch) {
    return next(ApiError.notFound('Batch not found'));
  }

  res.status(200).json(ApiResponse.success(batch));
});

// @desc    Create batch
// @route   POST /api/v1/batches
// @access  Private (SUPER_ADMIN, ADMIN)
const createBatch = asyncHandler(async (req, res, next) => {
  const {
    batchCode,
    title,
    internshipId,
    teachers = [],
    students = [],
    startDate,
    endDate,
    maxStudents,
    scheduleDetails,
    status,
  } = req.body;

  const existing = await InternshipBatch.findOne({ batchCode: batchCode.toUpperCase() });
  if (existing) {
    return next(ApiError.conflict(`Batch with code ${batchCode} already exists.`));
  }

  const batch = await InternshipBatch.create({
    batchCode: batchCode.toUpperCase(),
    title,
    internshipId,
    teachers,
    students,
    startDate,
    endDate,
    maxStudents: maxStudents || 50,
    scheduleDetails,
    status: status || 'Ongoing',
    createdBy: req.user._id,
  });

  // Also update teacher profiles assignedBatches
  if (teachers.length > 0) {
    await TeacherProfile.updateMany(
      { userId: { $in: teachers } },
      { $addToSet: { assignedBatches: batch._id } }
    );
  }

  // Also update student profiles batchId & internshipId
  if (students.length > 0) {
    await StudentProfile.updateMany(
      { userId: { $in: students } },
      { $set: { batchId: batch._id, internshipId, status: 'Active' } }
    );
  }

  res.status(201).json(ApiResponse.created(batch, 'Batch created successfully'));
});

// @desc    Update batch
// @route   PUT /api/v1/batches/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateBatch = asyncHandler(async (req, res, next) => {
  const batch = await InternshipBatch.findById(req.params.id);
  if (!batch) {
    return next(ApiError.notFound('Batch not found'));
  }

  const fields = [
    'title',
    'startDate',
    'endDate',
    'maxStudents',
    'scheduleDetails',
    'status',
    'teachers',
    'students',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      batch[f] = req.body[f];
    }
  });

  batch.updatedBy = req.user._id;
  await batch.save();

  // If teachers updated, sync TeacherProfile
  if (req.body.teachers) {
    await TeacherProfile.updateMany(
      { userId: { $in: req.body.teachers } },
      { $addToSet: { assignedBatches: batch._id } }
    );
  }

  res.status(200).json(ApiResponse.success(batch, 'Batch updated successfully'));
});

// @desc    Enroll students to batch
// @route   POST /api/v1/batches/:id/enroll
// @access  Private (SUPER_ADMIN, ADMIN)
const enrollStudents = asyncHandler(async (req, res, next) => {
  const { studentIds } = req.body; // array of User ObjectIds
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return next(ApiError.badRequest('Please provide an array of student user IDs to enroll.'));
  }

  const batch = await InternshipBatch.findById(req.params.id);
  if (!batch) {
    return next(ApiError.notFound('Batch not found'));
  }

  // Add students to batch
  await InternshipBatch.findByIdAndUpdate(batch._id, {
    $addToSet: { students: { $each: studentIds } },
  });

  // Update StudentProfiles
  await StudentProfile.updateMany(
    { userId: { $in: studentIds } },
    { $set: { batchId: batch._id, internshipId: batch.internshipId, status: 'Active' } }
  );

  const updatedBatch = await InternshipBatch.findById(batch._id).populate('students', 'name email');
  res.status(200).json(ApiResponse.success(updatedBatch, 'Students enrolled successfully'));
});

// @desc    Delete batch
// @route   DELETE /api/v1/batches/:id
// @access  Private (SUPER_ADMIN)
const deleteBatch = asyncHandler(async (req, res, next) => {
  const batch = await InternshipBatch.findById(req.params.id);
  if (!batch) {
    return next(ApiError.notFound('Batch not found'));
  }

  await InternshipBatch.findByIdAndDelete(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Batch deleted successfully'));
});

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  enrollStudents,
  deleteBatch,
};
