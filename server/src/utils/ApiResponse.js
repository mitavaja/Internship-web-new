class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  static success(data, message = 'Success', meta = null) {
    return new ApiResponse(200, data, message, meta);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }
}

module.exports = ApiResponse;
