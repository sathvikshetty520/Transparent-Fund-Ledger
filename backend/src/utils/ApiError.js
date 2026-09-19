class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(
      400,
      "VALIDATION_ERROR",
      message,
      details
    );
  }

  static unauthenticated(message = "Authentication required") {
    return new ApiError(
      401,
      "UNAUTHENTICATED",
      message
    );
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(
      403,
      "FORBIDDEN",
      message
    );
  }

  static notFound(message = "Resource not found") {
    return new ApiError(
      404,
      "NOT_FOUND",
      message
    );
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(
      409,
      "CONFLICT",
      message
    );
  }

  static ruleViolation(message, details = null) {
    return new ApiError(
      422,
      "RULE_VIOLATION",
      message,
      details
    );
  }

  static internal(message = "Internal server error") {
    return new ApiError(
      500,
      "INTERNAL_ERROR",
      message
    );
  }
}

module.exports = ApiError;