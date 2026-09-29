const Result = require('../models/Result');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Publish / create evaluation result
// @route   POST /api/v1/results
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const createResult = asyncHandler(async (req, res) => {
  const { studentId, batchId, internshipId, title, evaluationType, totalMarks, marksObtained, remarks, published } =
    req.body;

  const result = await Result.create({
    studentId,
    batchId,
    internshipId,
    title,
    evaluationType: evaluationType || 'Final',
    totalMarks: totalMarks || 100,
    marksObtained,
    remarks: remarks || '',
    published: published !== undefined ? published : true,
    evaluatedBy: req.user._id,
    createdBy: req.user._id,
  });

  if (result.published) {
    await Notification.create({
      recipientId: studentId,
      title: `Result Published: ${title}`,
      message: `Your score for ${title} has been published: ${marksObtained}/${totalMarks} (Grade: ${result.grade})`,
      type: 'Grade',
      link: '/results',
    });
  }

  res.status(201).json(ApiResponse.created(result, 'Result recorded successfully'));
});

// @desc    Get all results
// @route   GET /api/v1/results
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getResults = asyncHandler(async (req, res) => {
  const result = await applyQuery(Result, req.query, {
    populate: [
      { path: 'studentId', select: 'name email avatar' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'internshipId', select: 'title code' },
      { path: 'evaluatedBy', select: 'name' },
    ],
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Results retrieved', result.meta));
});

// @desc    Get my results (STUDENT)
// @route   GET /api/v1/results/my-results
// @access  Private (STUDENT)
const getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({
    studentId: req.user._id,
    published: true,
  })
    .populate('internshipId', 'title code')
    .populate('batchId', 'title batchCode')
    .sort('-createdAt');

  res.status(200).json(ApiResponse.success(results, 'My results retrieved'));
});

// @desc    Update result
// @route   PUT /api/v1/results/:id
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const updateResult = asyncHandler(async (req, res, next) => {
  const result = await Result.findById(req.params.id);
  if (!result) {
    return next(ApiError.notFound('Result not found'));
  }

  const fields = ['title', 'evaluationType', 'totalMarks', 'marksObtained', 'remarks', 'published'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      result[f] = req.body[f];
    }
  });

  result.updatedBy = req.user._id;
  await result.save();

  res.status(200).json(ApiResponse.success(result, 'Result updated successfully'));
});

// @desc    Delete result
// @route   DELETE /api/v1/results/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const deleteResult = asyncHandler(async (req, res, next) => {
  const result = await Result.findById(req.params.id);
  if (!result) {
    return next(ApiError.notFound('Result not found'));
  }

  await Result.findByIdAndDelete(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Result deleted successfully'));
});

module.exports = {
  createResult,
  getResults,
  getMyResults,
  updateResult,
  deleteResult,
};
