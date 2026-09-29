const ApiError = require('../utils/ApiError');
const config = require('../config/environment');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Zod validation error
  if (err.name === 'ZodError') {
    const issues = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    error = new ApiError(400, 'Validation Error', issues);
  }

  // Handle Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    const issues = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    error = new ApiError(400, 'Invalid Input Data', issues);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(409, `Duplicate value for field '${field}': "${value}". Please use another value.`);
  }

  // Handle Multer upload errors
  else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(400, `File exceeds size limit of ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB.`);
    } else {
      error = new ApiError(400, `Upload error: ${err.message}`);
    }
  }

  // Ensure error is an instance of ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(config.env === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
