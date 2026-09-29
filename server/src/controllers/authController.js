const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register a new user (Student by default)
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role = 'STUDENT', phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(ApiError.conflict('An account with this email already exists.'));
  }

  // Prevent direct public registration of SUPER_ADMIN or ADMIN
  const assignedRole = ['SUPER_ADMIN', 'ADMIN'].includes(role) ? 'STUDENT' : role;

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    phone: phone || '',
  });

  // Create corresponding role profile
  if (assignedRole === 'STUDENT') {
    const studentCount = await StudentProfile.countDocuments();
    const rollNumber = `MD-STU-${new Date().getFullYear()}-${String(studentCount + 1).padStart(4, '0')}`;
    await StudentProfile.create({
      userId: user._id,
      studentId: rollNumber,
      createdBy: user._id,
    });
  } else if (assignedRole === 'TEACHER') {
    const teacherCount = await TeacherProfile.countDocuments();
    const empId = `MD-EMP-${String(teacherCount + 1).padStart(3, '0')}`;
    await TeacherProfile.create({
      userId: user._id,
      employeeId: empId,
      createdBy: user._id,
    });
  }

  const token = user.generateAuthToken();

  res.status(201).json(
    ApiResponse.created(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
      'User registered successfully'
    )
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(ApiError.unauthorized('Invalid email or password.'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(ApiError.unauthorized('Invalid email or password.'));
  }

  if (!user.isActive) {
    return next(ApiError.forbidden('Your account has been deactivated. Please contact administrator.'));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = user.generateAuthToken();

  // Fetch student or teacher profile if relevant
  let profile = null;
  if (user.role === 'STUDENT') {
    profile = await StudentProfile.findOne({ userId: user._id })
      .populate('internshipId', 'title code durationWeeks')
      .populate('batchId', 'title batchCode startDate endDate');
  } else if (user.role === 'TEACHER') {
    profile = await TeacherProfile.findOne({ userId: user._id }).populate('assignedBatches', 'title batchCode');
  }

  res.status(200).json(
    ApiResponse.success(
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          profile,
        },
      },
      'Logged in successfully'
    )
  );
});

// @desc    Get current logged in user details & profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let profile = null;
  if (user.role === 'STUDENT') {
    profile = await StudentProfile.findOne({ userId: user._id })
      .populate('internshipId', 'title code durationWeeks')
      .populate('batchId', 'title batchCode startDate endDate scheduleDetails');
  } else if (user.role === 'TEACHER') {
    profile = await TeacherProfile.findOne({ userId: user._id }).populate('assignedBatches', 'title batchCode');
  }

  res.status(200).json(
    ApiResponse.success(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt,
          profile,
        },
      },
      'Profile retrieved successfully'
    )
  );
});

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(ApiError.badRequest('Current password does not match.'));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(ApiResponse.success(null, 'Password updated successfully.'));
});

// @desc    Update user profile details
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  user.updatedBy = user._id;
  await user.save();

  res.status(200).json(ApiResponse.success(user, 'User profile updated successfully'));
});

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  updateProfile,
};
