const Document = require('../models/Document');
const StudentProfile = require('../models/StudentProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Upload or add document resource
// @route   POST /api/v1/documents
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const createDocument = asyncHandler(async (req, res, next) => {
  const { title, category, fileUrl, fileSize, fileType, internshipId, batchId, isPublicToStudents } = req.body;

  let finalUrl = fileUrl;
  let finalSize = fileSize || 0;
  let finalType = fileType || 'pdf';

  if (req.file) {
    finalUrl = `/uploads/documents/${req.file.filename}`;
    finalSize = req.file.size;
    finalType = req.file.mimetype;
  }

  if (!finalUrl) {
    return next(ApiError.badRequest('Please provide a fileUrl or upload a file.'));
  }

  const document = await Document.create({
    title,
    category: category || 'StudyMaterial',
    fileUrl: finalUrl,
    fileSize: finalSize,
    fileType: finalType,
    internshipId: internshipId || null,
    batchId: batchId || null,
    isPublicToStudents: isPublicToStudents !== undefined ? isPublicToStudents : true,
    uploadedBy: req.user._id,
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(document, 'Document added successfully'));
});

// @desc    Get all documents (with filtering)
// @route   GET /api/v1/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
  const baseFilter = {};

  if (req.user.role === 'STUDENT') {
    baseFilter.isPublicToStudents = true;
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile) {
      baseFilter.$or = [
        { batchId: null, internshipId: null },
        { batchId: profile.batchId },
        { internshipId: profile.internshipId },
      ];
    }
  }

  const result = await applyQuery(Document, req.query, {
    searchFields: ['title', 'category'],
    populate: [
      { path: 'internshipId', select: 'title code' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'uploadedBy', select: 'name email' },
    ],
    baseFilter,
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Documents retrieved', result.meta));
});

// @desc    Delete document
// @route   DELETE /api/v1/documents/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return next(ApiError.notFound('Document not found'));
  }

  await Document.findByIdAndDelete(req.params.id);
  res.status(200).json(ApiResponse.success(null, 'Document deleted successfully'));
});

module.exports = {
  createDocument,
  getDocuments,
  deleteDocument,
};
