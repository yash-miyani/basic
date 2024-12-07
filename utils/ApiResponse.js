class ApiResponse {
  constructor(statusCode, message = "Success", data, pagination) {
    (this.statusCode = statusCode),
      (this.message = message),
      (this.data = data),
      (this.pagination = pagination);
  }
}

module.exports = ApiResponse;
