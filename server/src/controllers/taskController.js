const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const StudentProfile = require('../models/StudentProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const result = await applyQuery(Task, req.query, {
    searchFields: ['title', 'description', 'taskCode'],
    populate: [
      { path: 'internshipId', select: 'title code' },
      { path: 'batchId', select: 'title batchCode' },
      { path: 'teacherId', select: 'name email avatar' },
    ],
    defaultSort: '-createdAt',
  });

  res.status(200).json(ApiResponse.success(result.results, 'Tasks retrieved', result.meta));
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('internshipId', 'title code')
    .populate('batchId', 'title batchCode')
    .populate('teacherId', 'name email avatar');

  if (!task) {
    return next(ApiError.notFound('Task not found'));
  }

  // If student is viewing, attach their submission if exists
  let mySubmission = null;
  if (req.user.role === 'STUDENT') {
    mySubmission = await TaskSubmission.findOne({
      taskId: task._id,
      studentId: req.user._id,
    });
  }

  res.status(200).json(
    ApiResponse.success({
      ...task.toObject(),
      mySubmission,
    })
  );
});

// @desc    Get tasks for current student (with their submission status)
// @route   GET /api/v1/tasks/student/my-tasks
// @access  Private (STUDENT)
const getMyStudentTasks = asyncHandler(async (req, res, next) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile || !profile.batchId) {
    return res.status(200).json(ApiResponse.success([], 'No batch assigned yet'));
  }

  const tasks = await Task.find({ batchId: profile.batchId })
    .populate('internshipId', 'title code')
    .populate('batchId', 'title batchCode')
    .populate('teacherId', 'name email')
    .sort('-dueDate');

  // Fetch submissions for this student
  const submissions = await TaskSubmission.find({ studentId: req.user._id });
  const subMap = new Map();
  submissions.forEach((sub) => subMap.set(sub.taskId.toString(), sub));

  const enrichedTasks = tasks.map((t) => {
    const sub = subMap.get(t._id.toString());
    return {
      ...t.toObject(),
      submission: sub || null,
      submissionStatus: sub ? sub.status : 'Pending',
    };
  });

  res.status(200).json(ApiResponse.success(enrichedTasks, 'Student tasks retrieved'));
});

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, internshipId, batchId, dueDate, maxScore, taskType, priority, attachments } =
    req.body;

  const task = await Task.create({
    title,
    description,
    internshipId,
    batchId,
    teacherId: req.user._id,
    dueDate,
    maxScore: maxScore || 100,
    taskType: taskType || 'Assignment',
    priority: priority || 'Medium',
    attachments: attachments || [],
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.created(task, 'Task created successfully'));
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private (SUPER_ADMIN, ADMIN, TEACHER)
const updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(ApiError.notFound('Task not found'));
  }

  const fields = ['title', 'description', 'dueDate', 'maxScore', 'taskType', 'priority', 'attachments'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      task[f] = req.body[f];
    }
  });

  task.updatedBy = req.user._id;
  await task.save();

  res.status(200).json(ApiResponse.success(task, 'Task updated successfully'));
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(ApiError.notFound('Task not found'));
  }

  await Task.findByIdAndDelete(req.params.id);
  await TaskSubmission.deleteMany({ taskId: req.params.id });

  res.status(200).json(ApiResponse.success(null, 'Task deleted successfully'));
});

module.exports = {
  getTasks,
  getTaskById,
  getMyStudentTasks,
  createTask,
  updateTask,
  deleteTask,
};
