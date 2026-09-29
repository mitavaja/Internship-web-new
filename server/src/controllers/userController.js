const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { applyQuery } = require('../utils/queryHelper');

// @desc    Get all users with filtering, sorting, pagination
// @route   GET /api/v1/users
// @access  Private (SUPER_ADMIN, ADMIN)
const getUsers = asyncHandler(async (req, res) => {
  const result = await applyQuery(User, req.query, {
    searchFields: ['name', 'email', 'phone'],
    defaultSort: '-createdAt',
  });
  res.status(200).json(ApiResponse.success(result.results, 'Users retrieved', result.meta));
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(ApiError.notFound('User not found'));
  }
  res.status(200).json(ApiResponse.success(user));
});

// @desc    Create user by Admin/SuperAdmin
// @route   POST /api/v1/users
// @access  Private (SUPER_ADMIN, ADMIN)
const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(ApiError.conflict('User with this email already exists'));
  }

  const user = await User.create({
    name,
    email,
    password: password || 'Password123!',
    role: role || 'STUDENT',
    phone: phone || '',
    createdBy: req.user._id,
  });

  if (user.role === 'STUDENT') {
    const studentCount = await StudentProfile.countDocuments();
    await StudentProfile.create({
      userId: user._id,
      studentId: `MD-STU-${new Date().getFullYear()}-${String(studentCount + 1).padStart(4, '0')}`,
      createdBy: req.user._id,
    });
  } else if (user.role === 'TEACHER') {
    const teacherCount = await TeacherProfile.countDocuments();
    await TeacherProfile.create({
      userId: user._id,
      employeeId: `MD-EMP-${String(teacherCount + 1).padStart(3, '0')}`,
      createdBy: req.user._id,
    });
  }

  res.status(201).json(ApiResponse.created(user, 'User created successfully'));
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private (SUPER_ADMIN, ADMIN)
const updateUser = asyncHandler(async (req, res, next) => {
  const { name, phone, role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(ApiError.notFound('User not found'));
  }

  // Prevent modifying Super Admin role unless you are Super Admin
  if (user.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return next(ApiError.forbidden('Only Super Admins can modify Super Admin accounts'));
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  user.updatedBy = req.user._id;

  await user.save();
  res.status(200).json(ApiResponse.success(user, 'User updated successfully'));
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (SUPER_ADMIN)
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(ApiError.notFound('User not found'));
  }

  if (user.role === 'SUPER_ADMIN') {
    return next(ApiError.forbidden('Cannot delete Super Admin account'));
  }

  await User.findByIdAndDelete(req.params.id);
  await StudentProfile.findOneAndDelete({ userId: req.params.id });
  await TeacherProfile.findOneAndDelete({ userId: req.params.id });

  res.status(200).json(ApiResponse.success(null, 'User deleted successfully'));
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
