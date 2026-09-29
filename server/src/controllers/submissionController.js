const TaskSubmission = require('../models/TaskSubmission');
const Task = require('../models/Task');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Submit or update task solution
// @route   POST /api/v1/submissions
// @access  Private (STUDENT)
const submitTask = asyncHandler(async (req, res, next) => {
  const { taskId, githubUrl, liveUrl, notes, submissionFiles } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    return next(ApiError.notFound('Task not found'));
  }

  // Check student profile for batch
  const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
  if (!studentProfile || !studentProfile.batchId) {
    return next(ApiError.badRequest('You are not assigned to any batch.'));
  }

  const isLate = new Date() > new Date(task.dueDate);
  const status = isLate ? 'Late' : 'Submitted';

  let submission = await TaskSubmission.findOne({
    taskId,
    studentId: req.user._id,
  });

  if (submission) {
    // Update existing submission (resubmit)
    submission.githubUrl = githubUrl !== undefined ? githubUrl : submission.githubUrl;
    submission.liveUrl = liveUrl !== undefined ? liveUrl : submission.liveUrl;
    submission.notes = notes !== undefined ? notes : submission.notes;
    if (submissionFiles && submissionFiles.length > 0) {
      submission.submissionFiles = submissionFiles;
    }
    submission.submittedAt = new Date();
    submission.status = isLate ? 'Late' : 'Resubmitted';
    submission.updatedBy = req.user._id;
    await submission.save();
  } else {
    // Create new submission
    submission = await TaskSubmission.create({
      taskId,
      studentId: req.user._id,
      batchId: studentProfile.batchId,
      submissionFiles: submissionFiles || [],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      notes: notes || '',
      submittedAt: new Date(),
      status,
      maxScore: task.maxScore,
      createdBy: req.user._id,
    });
  }

  // Notify the teacher
  await Notification.create({
    recipientId: task.teacherId,
    title: `Task Submission: ${task.title}`,
    message: `${req.user.name} submitted assignment "${task.title}"`,
    type: 'Task',
    link: `/submissions/${submission._id}`,
    metadata: { taskId: task._id, submissionId: submission._id },
  });

  res.status(201).json(ApiResponse.created(submission, 'Assignment submitted successfully'));
});

// @desc    Get all submissions (with filters by task, student, batch, status)
// @route   GET /api/v1/submissions
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const getSubmissions = asyncHandler(async (req, res) => {
  const result = await applyQuery(TaskSubmission, req.query, {
    populate: [
      { path: 'taskId', select: 'title taskCode dueDate maxScore' },
      { path: 'studentId', select: 'name email avatar' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'reviewedBy', select: 'name email' },
    ],
    defaultSort: '-submittedAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Submissions retrieved', result.meta));
});

// @desc    Get single submission
// @route   GET /api/v1/submissions/:id
// @access  Private
const getSubmissionById = asyncHandler(async (req, res, next) => {
  const submission = await TaskSubmission.findById(req.params.id)
    .populate('taskId')
    .populate('studentId', 'name email phone avatar')
    .populate('batchId', 'title batchCode')
    .populate('reviewedBy', 'name email');

  if (!submission) {
    return next(ApiError.notFound('Submission not found'));
  }

  res.status(200).json(ApiResponse.success(submission));
});

// @desc    Grade / review submission
// @route   PUT /api/v1/submissions/:id/grade
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const gradeSubmission = asyncHandler(async (req, res, next) => {
  const { score, feedback, status } = req.body;

  const submission = await TaskSubmission.findById(req.params.id).populate('taskId');
  if (!submission) {
    return next(ApiError.notFound('Submission not found'));
  }

  if (score > submission.maxScore) {
    return next(ApiError.badRequest(`Score cannot exceed maximum score of ${submission.maxScore}`));
  }

  submission.score = score;
  submission.feedback = feedback;
  submission.status = status || 'Reviewed';
  submission.reviewedBy = req.user._id;
  submission.reviewedAt = new Date();
  submission.updatedBy = req.user._id;

  await submission.save();

  // Send notification to student
  await Notification.create({
    recipientId: submission.studentId,
    title: `Assignment Graded: ${submission.taskId.title}`,
    message: `Your submission for "${submission.taskId.title}" has been graded: ${score}/${submission.maxScore}. Feedback: ${feedback}`,
    type: 'Grade',
    link: `/tasks/${submission.taskId._id}`,
    metadata: { taskId: submission.taskId._id, score },
  });

  res.status(200).json(ApiResponse.success(submission, 'Submission graded successfully'));
});

// @desc    Get my submissions as student
// @route   GET /api/v1/submissions/student/my-submissions
// @access  Private (STUDENT)
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await TaskSubmission.find({ studentId: req.user._id })
    .populate('taskId', 'title taskCode dueDate maxScore taskType')
    .populate('batchId', 'title batchCode')
    .populate('reviewedBy', 'name')
    .sort('-submittedAt');

  res.status(200).json(ApiResponse.success(submissions, 'My submissions retrieved'));
});

const deleteSubmission = asyncHandler(async (req, res, next) => {
  const submission = await TaskSubmission.findByIdAndDelete(req.params.id);
  if (!submission) return next(ApiError.notFound('Submission not found'));
  res.status(200).json(ApiResponse.success(null, 'Submission deleted successfully'));
});

module.exports = {
  submitTask,
  getSubmissions,
  getSubmissionById,
  gradeSubmission,
  getMySubmissions,
  deleteSubmission,
};
