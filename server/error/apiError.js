module.exports = class ApiError extends Error{
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован')
  }

  static InternalError(message, errors = []) {
    return new ApiError(500, message, errors)
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors)
  }

  static Forbidden() {
    return new ApiError(403, "Нет доступа");
  }

}


