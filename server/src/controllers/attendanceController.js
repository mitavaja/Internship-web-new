const Attendance = require('../models/Attendance');
const InternshipBatch = require('../models/InternshipBatch');
const StudentProfile = require('../models/StudentProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Mark attendance for an entire batch on a date
// @route   POST /api/v1/attendance/batch
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const markBatchAttendance = asyncHandler(async (req, res, next) => {
  const { batchId, date, records } = req.body; // records: [{ studentId, status, notes }]

  if (!batchId || !date || !records || !Array.isArray(records)) {
    return next(ApiError.badRequest('Please provide batchId, date, and student records array.'));
  }

  // Normalize date to start of day UTC
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  const bulkOps = records.map((rec) => ({
    updateOne: {
      filter: { batchId, studentId: rec.studentId, date: targetDate },
      update: {
        $set: {
          status: rec.status || 'Present',
          notes: rec.notes || '',
          markedBy: req.user._id,
          updatedBy: req.user._id,
        },
        $setOnInsert: {
          checkInTime: new Date(),
          createdBy: req.user._id,
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await Attendance.bulkWrite(bulkOps);
  }

  res.status(200).json(ApiResponse.success(null, 'Batch attendance marked successfully'));
});

// @desc    Student self check-in for today
// @route   POST /api/v1/attendance/check-in
// @access  Private (STUDENT)
const studentCheckIn = asyncHandler(async (req, res, next) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile || !profile.batchId) {
    return next(ApiError.badRequest('You are not assigned to an active batch.'));
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({
    batchId: profile.batchId,
    studentId: req.user._id,
    date: today,
  });

  if (existing) {
    return res.status(200).json(ApiResponse.success(existing, 'Attendance already marked for today'));
  }

  const attendance = await Attendance.create({
    batchId: profile.batchId,
    studentId: req.user._id,
    date: today,
    status: 'Present',
    checkInTime: new Date(),
    markedBy: req.user._id,
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(attendance, 'Attendance checked-in successfully'));
});

// @desc    Get attendance for a specific batch and date
// @route   GET /api/v1/attendance/batch/:batchId
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getBatchAttendance = asyncHandler(async (req, res, next) => {
  const { batchId } = req.params;
  const { date } = req.query;

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setUTCHours(0, 0, 0, 0);

  const batch = await InternshipBatch.findById(batchId).populate('students', 'name email avatar phone');
  if (!batch) {
    return next(ApiError.notFound('Batch not found'));
  }

  const records = await Attendance.find({
    batchId,
    date: targetDate,
  });

  const recordMap = new Map();
  records.forEach((r) => recordMap.set(r.studentId.toString(), r));

  const sheet = batch.students.map((student) => {
    const record = recordMap.get(student._id.toString());
    return {
      studentId: student._id,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      status: record ? record.status : 'Absent',
      checkInTime: record ? record.checkInTime : null,
      notes: record ? record.notes : '',
    };
  });

  res.status(200).json(ApiResponse.success({ date: targetDate, sheet }));
});

// @desc    Get my attendance summary and history (STUDENT)
// @route   GET /api/v1/attendance/my-attendance
// @access  Private (STUDENT)
const getMyAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ studentId: req.user._id }).sort('-date');

  const total = records.length;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const late = records.filter((r) => r.status === 'Late').length;
  const excused = records.filter((r) => r.status === 'Excused').length;

  const attendanceRate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

  res.status(200).json(
    ApiResponse.success({
      summary: {
        totalDays: total,
        present,
        absent,
        late,
        excused,
        attendanceRate,
      },
      records,
    })
  );
});

module.exports = {
  markBatchAttendance,
  studentCheckIn,
  getBatchAttendance,
  getMyAttendance,
};
