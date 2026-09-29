const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Internship = require('../models/Internship');
const InternshipBatch = require('../models/InternshipBatch');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Issue a completion certificate
// @route   POST /api/v1/certificates/issue
// @access  Private (SUPER_ADMIN, ADMIN)
const issueCertificate = asyncHandler(async (req, res, next) => {
  const { studentId, batchId, internshipId, completionDate, grade = 'A', templateData } = req.body;

  const student = await User.findById(studentId);
  if (!student) return next(ApiError.notFound('Student not found'));

  const internship = await Internship.findById(internshipId);
  if (!internship) return next(ApiError.notFound('Internship not found'));

  const batch = await InternshipBatch.findById(batchId);
  if (!batch) return next(ApiError.notFound('Batch not found'));

  const certCount = await Certificate.countDocuments();
  const certNumber = `MD-CERT-${new Date().getFullYear()}-${String(certCount + 1).padStart(4, '0')}`;
  const verificationCode = crypto.randomBytes(6).toString('hex').toUpperCase();

  const certificate = await Certificate.create({
    certificateNumber: certNumber,
    studentId,
    internshipId,
    batchId,
    issueDate: new Date(),
    completionDate: new Date(completionDate),
    grade,
    verificationCode,
    verificationUrl: `/verify/${verificationCode}`,
    templateData: {
      studentName: templateData?.studentName || student.name,
      internshipTitle: templateData?.internshipTitle || internship.title,
      batchCode: templateData?.batchCode || batch.batchCode,
      directorSignature: 'MAINDOT Academic Directorate',
    },
    status: 'Issued',
    issuedBy: req.user._id,
    createdBy: req.user._id,
  });

  // Update student status to Completed
  await StudentProfile.findOneAndUpdate(
    { userId: studentId },
    { status: 'Completed', completionDate: new Date(completionDate) }
  );

  // Send notification to student
  await Notification.create({
    recipientId: studentId,
    title: 'Certificate Issued! 🎓',
    message: `Congratulations! Your certificate for "${internship.title}" has been issued. Certificate No: ${certNumber}`,
    type: 'Grade',
    link: '/certificates',
  });

  res.status(201).json(ApiResponse.created(certificate, 'Certificate issued successfully'));
});

// @desc    Get all certificates (with pagination and filters)
// @route   GET /api/v1/certificates
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getAllCertificates = asyncHandler(async (req, res) => {
  const result = await applyQuery(Certificate, req.query, {
    searchFields: ['certificateNumber', 'verificationCode'],
    populate: [
      { path: 'studentId', select: 'name email avatar' },
      { path: 'internshipId', select: 'title code' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'issuedBy', select: 'name' },
    ],
    defaultSort: '-issueDate',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Certificates retrieved', result.meta));
});

// @desc    Get my certificates (STUDENT)
// @route   GET /api/v1/certificates/my-certificates
// @access  Private (STUDENT)
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    studentId: req.user._id,
    status: 'Issued',
  })
    .populate('internshipId', 'title code durationWeeks')
    .populate('batchId', 'title batchCode')
    .populate('issuedBy', 'name')
    .sort('-issueDate');

  res.status(200).json(ApiResponse.success(certificates, 'My certificates retrieved'));
});

// @desc    Verify certificate by public verification code
// @route   GET /api/v1/certificates/verify/:code
// @access  Public
const verifyCertificate = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  const certificate = await Certificate.findOne({
    verificationCode: code.toUpperCase(),
  })
    .populate('studentId', 'name email avatar')
    .populate('internshipId', 'title code durationWeeks domain')
    .populate('batchId', 'title batchCode startDate endDate')
    .populate('issuedBy', 'name');

  if (!certificate) {
    return next(ApiError.notFound('Certificate verification failed. Code is invalid or does not exist.'));
  }

  res.status(200).json(
    ApiResponse.success(
      {
        valid: certificate.status === 'Issued',
        status: certificate.status,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.templateData?.studentName || certificate.studentId?.name,
        internshipTitle: certificate.templateData?.internshipTitle || certificate.internshipId?.title,
        batchCode: certificate.templateData?.batchCode || certificate.batchId?.batchCode,
        issueDate: certificate.issueDate,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        verificationCode: certificate.verificationCode,
        organization: 'MAINDOT',
      },
      'Certificate verified successfully'
    )
  );
});

// @desc    Revoke certificate
// @route   PUT /api/v1/certificates/:id/revoke
// @access  Private (SUPER_ADMIN)
const revokeCertificate = asyncHandler(async (req, res, next) => {
  const cert = await Certificate.findById(req.params.id);
  if (!cert) return next(ApiError.notFound('Certificate not found'));

  cert.status = 'Revoked';
  cert.updatedBy = req.user._id;
  await cert.save();

  res.status(200).json(ApiResponse.success(cert, 'Certificate revoked successfully'));
});

module.exports = {
  issueCertificate,
  getAllCertificates,
  getMyCertificates,
  verifyCertificate,
  revokeCertificate,
};
