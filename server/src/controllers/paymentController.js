const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Record or create payment
// @route   POST /api/v1/payments
// @access  Private
const createPayment = asyncHandler(async (req, res, next) => {
  const { studentId, internshipId, batchId, amount, currency, paymentMethod, transactionId, notes } = req.body;

  const targetStudentId = req.user.role === 'STUDENT' ? req.user._id : studentId;
  if (!targetStudentId) {
    return next(ApiError.badRequest('Student ID is required'));
  }

  const paymentCount = await Payment.countDocuments();
  const invoiceNumber = `MD-INV-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(4, '0')}`;

  const payment = await Payment.create({
    invoiceNumber,
    studentId: targetStudentId,
    internshipId,
    batchId: batchId || null,
    amount,
    currency: currency || 'INR',
    paymentMethod: paymentMethod || 'Online',
    transactionId: transactionId || `TXN-${Date.now()}`,
    paymentDate: new Date(),
    status: req.user.role === 'STUDENT' ? 'Pending' : 'Completed',
    notes: notes || '',
    verifiedBy: req.user.role !== 'STUDENT' ? req.user._id : null,
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(payment, 'Payment recorded successfully'));
});

// @desc    Get all payments
// @route   GET /api/v1/payments
// @access  Private (SUPER_ADMIN, ADMIN)
const getPayments = asyncHandler(async (req, res) => {
  const result = await applyQuery(Payment, req.query, {
    searchFields: ['invoiceNumber', 'transactionId'],
    populate: [
      { path: 'studentId', select: 'name email phone' },
      { path: 'internshipId', select: 'title code fee' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'verifiedBy', select: 'name' },
    ],
    defaultSort: '-paymentDate',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Payments retrieved', result.meta));
});

// @desc    Get my payments (STUDENT)
// @route   GET /api/v1/payments/my-payments
// @access  Private (STUDENT)
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ studentId: req.user._id })
    .populate('internshipId', 'title code fee')
    .populate('batchId', 'title batchCode')
    .sort('-paymentDate');

  res.status(200).json(ApiResponse.success(payments, 'My payments retrieved'));
});

// @desc    Update payment status
// @route   PUT /api/v1/payments/:id/status
// @access  Private (SUPER_ADMIN, ADMIN)
const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return next(ApiError.notFound('Payment record not found'));
  }

  payment.status = status;
  if (notes !== undefined) payment.notes = notes;
  if (status === 'Completed') {
    payment.verifiedBy = req.user._id;
  }
  payment.updatedBy = req.user._id;
  await payment.save();

  res.status(200).json(ApiResponse.success(payment, 'Payment status updated'));
});

const deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) return next(ApiError.notFound('Payment record not found'));
  res.status(200).json(ApiResponse.success(null, 'Payment record deleted'));
});

module.exports = {
  createPayment,
  getPayments,
  getMyPayments,
  updatePaymentStatus,
  deletePayment,
};
