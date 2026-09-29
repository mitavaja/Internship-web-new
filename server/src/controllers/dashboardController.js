const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const Internship = require('../models/Internship');
const InternshipBatch = require('../models/InternshipBatch');
const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Payment = require('../models/Payment');
const Announcement = require('../models/Announcement');
const Meeting = require('../models/Meeting');
const Result = require('../models/Result');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard analytics based on user role
// @route   GET /api/v1/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const { role } = req.user;

  // 1. ADMIN & SUPER_ADMIN DASHBOARD STATS
  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    const [
      totalStudents,
      activeBatches,
      totalTeachers,
      totalInternships,
      pendingSubmissions,
      totalCertificates,
      payments,
      recentStudents,
      internshipDistribution,
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      InternshipBatch.countDocuments({ status: 'Ongoing' }),
      TeacherProfile.countDocuments(),
      Internship.countDocuments({ isActive: true }),
      TaskSubmission.countDocuments({ status: { $in: ['Submitted', 'Pending', 'Late'] } }),
      Certificate.countDocuments({ status: 'Issued' }),
      Payment.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      StudentProfile.find()
        .populate('userId', 'name email avatar createdAt')
        .populate('internshipId', 'title code')
        .sort('-createdAt')
        .limit(5),
      StudentProfile.aggregate([
        { $group: { _id: '$internshipId', count: { $sum: 1 } } },
        { $lookup: { from: 'internships', localField: '_id', foreignField: '_id', as: 'internship' } },
        { $unwind: { path: '$internship', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$internship.title', 'Unassigned'] },
            students: '$count',
          },
        },
      ]),
    ]);

    const totalRevenue = payments.length > 0 ? payments[0].totalRevenue : 0;

    return res.status(200).json(
      ApiResponse.success({
        role,
        kpis: {
          totalStudents,
          activeBatches,
          totalTeachers,
          totalInternships,
          pendingSubmissions,
          totalCertificates,
          totalRevenue,
        },
        charts: {
          internshipDistribution,
          submissionsBreakdown: [
            { name: 'Pending Review', value: pendingSubmissions },
            {
              name: 'Reviewed',
              value: await TaskSubmission.countDocuments({ status: 'Reviewed' }),
            },
          ],
        },
        recentStudents,
      })
    );
  }

  // 2. TEACHER DASHBOARD STATS
  if (role === 'TEACHER') {
    const teacherProfile = await TeacherProfile.findOne({ userId: req.user._id });
    const batchIds = teacherProfile ? teacherProfile.assignedBatches : [];

    const [myBatches, pendingSubmissions, upcomingMeetings] = await Promise.all([
      InternshipBatch.find({ _id: { $in: batchIds } }).populate('internshipId', 'title code'),
      TaskSubmission.countDocuments({
        batchId: { $in: batchIds },
        status: { $in: ['Submitted', 'Pending', 'Late'] },
      }),
      Meeting.find({
        batchId: { $in: batchIds },
        scheduledStartTime: { $gte: new Date() },
      })
        .sort('scheduledStartTime')
        .limit(5),
    ]);

    let totalStudentsInBatches = 0;
    myBatches.forEach((b) => {
      totalStudentsInBatches += b.students ? b.students.length : 0;
    });

    return res.status(200).json(
      ApiResponse.success({
        role,
        kpis: {
          assignedBatchesCount: myBatches.length,
          totalStudents: totalStudentsInBatches,
          pendingSubmissions,
          upcomingMeetingsCount: upcomingMeetings.length,
        },
        batches: myBatches,
        upcomingMeetings,
      })
    );
  }

  // 3. STUDENT DASHBOARD STATS
  if (role === 'STUDENT') {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('internshipId', 'title code durationWeeks fee')
      .populate({
        path: 'batchId',
        populate: { path: 'teachers', select: 'name email avatar' },
      });

    const batchId = profile ? profile.batchId?._id : null;

    let pendingTasksCount = 0;
    let totalTasksCount = 0;
    let attendanceRate = 100;
    let upcomingMeetings = [];
    let recentAnnouncements = [];
    let certificate = null;

    if (batchId) {
      totalTasksCount = await Task.countDocuments({ batchId });
      const submissions = await TaskSubmission.find({ studentId: req.user._id });
      const submittedTaskIds = submissions.map((s) => s.taskId.toString());
      pendingTasksCount = Math.max(0, totalTasksCount - submittedTaskIds.length);

      const attendanceRecords = await Attendance.find({ studentId: req.user._id });
      const presents = attendanceRecords.filter((r) => r.status === 'Present').length;
      if (attendanceRecords.length > 0) {
        attendanceRate = Math.round((presents / attendanceRecords.length) * 100);
      }

      upcomingMeetings = await Meeting.find({
        batchId,
        scheduledStartTime: { $gte: new Date() },
      })
        .sort('scheduledStartTime')
        .limit(3);

      recentAnnouncements = await Announcement.find({
        $or: [{ targetAudience: 'All' }, { targetAudience: 'Students' }, { targetBatchId: batchId }],
      })
        .sort('-publishDate')
        .limit(5);

      certificate = await Certificate.findOne({
        studentId: req.user._id,
        status: 'Issued',
      });
    }

    return res.status(200).json(
      ApiResponse.success({
        role,
        profile,
        kpis: {
          totalTasks: totalTasksCount,
          pendingTasks: pendingTasksCount,
          attendanceRate,
          certificateIssued: !!certificate,
        },
        upcomingMeetings,
        recentAnnouncements,
        certificate,
      })
    );
  }

  res.status(200).json(ApiResponse.success({ role }));
});

module.exports = {
  getDashboardStats,
};
