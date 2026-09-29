const Internship = require('../models/Internship');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get all internships (Public or Authenticated)
// @route   GET /api/v1/internships
// @access  Public
const getInternships = asyncHandler(async (req, res) => {
  const result = await applyQuery(Internship, req.query, {
    searchFields: ['title', 'code', 'domain', 'description'],
    defaultSort: 'title',
  });
  res.status(200).json(ApiResponse.success(result.results, 'Internships retrieved', result.meta));
});

// @desc    Get single internship
// @route   GET /api/v1/internships/:id
// @access  Public
const getInternshipById = asyncHandler(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    return next(ApiError.notFound('Internship track not found'));
  }
  res.status(200).json(ApiResponse.success(internship));
});

// @desc    Create internship track
// @route   POST /api/v1/internships
// @access  Private (SUPER_ADMIN, ADMIN)
const createInternship = asyncHandler(async (req, res, next) => {
  const { title, code, description, domain, durationWeeks, level, prerequisites, syllabus, fee, coverImage } =
    req.body;

  const existing = await Internship.findOne({ code: code.toUpperCase() });
  if (existing) {
    return next(ApiError.conflict(`Internship track with code ${code} already exists.`));
  }

  const internship = await Internship.create({
    title,
    code: code.toUpperCase(),
    description,
    domain,
    durationWeeks,
    level,
    prerequisites: prerequisites || [],
    syllabus: syllabus || [],
    fee: fee || 0,
    coverImage: coverImage || '',
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(internship, 'Internship track created successfully'));
});

// @desc    Update internship track
// @route   PUT /api/v1/internships/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateInternship = asyncHandler(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    return next(ApiError.notFound('Internship track not found'));
  }

  const fields = [
    'title',
    'description',
    'domain',
    'durationWeeks',
    'level',
    'prerequisites',
    'syllabus',
    'fee',
    'coverImage',
    'isActive',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      internship[f] = req.body[f];
    }
  });

  internship.updatedBy = req.user._id;
  await internship.save();

  res.status(200).json(ApiResponse.success(internship, 'Internship updated successfully'));
});

// @desc    Delete internship track
// @route   DELETE /api/v1/internships/:id
// @access  Private (SUPER_ADMIN)
const deleteInternship = asyncHandler(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    return next(ApiError.notFound('Internship track not found'));
  }

  await Internship.findByIdAndDelete(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Internship deleted successfully'));
});

module.exports = {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
};
