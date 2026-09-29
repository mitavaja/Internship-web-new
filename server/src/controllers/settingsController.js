const Settings = require('../models/Settings');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get portal settings
// @route   GET /api/v1/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      companyName: 'MAINDOT',
      companyEmail: 'maindot.tech@gmail.com',
      companyPhone: '+91 83208 18881',
      companyAddress: '225/4 Uniq Square, Opp. Shubham K Mart & Zudio, Dabholi, Katargam, Surat 395004',
      website: 'https://www.maindot.tech.com',
    });
  }

  res.status(200).json(ApiResponse.success(settings, 'Settings retrieved'));
});

// @desc    Update portal settings
// @route   PUT /api/v1/settings
// @access  Private (SUPER_ADMIN)
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }

  const fields = [
    'companyName',
    'companyEmail',
    'companyPhone',
    'companyAddress',
    'website',
    'logoUrl',
    'primaryColor',
    'academicYear',
    'termsAndConditions',
    'allowStudentRegistration',
    'requirePaymentForEnrollment',
    'notificationSettings',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      settings[f] = req.body[f];
    }
  });

  settings.updatedBy = req.user._id;
  await settings.save();

  res.status(200).json(ApiResponse.success(settings, 'Settings updated successfully'));
});

module.exports = {
  getSettings,
  updateSettings,
};
