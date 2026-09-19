 
const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");
const { failure } = require("../utils/response");

function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return failure(
      res,
      "VALIDATION_ERROR",
      "Request validation failed",
      400,
      error.issues
    );
  }

  if (error instanceof ApiError) {
    return failure(
      res,
      error.code,
      error.message,
      error.statusCode,
      error.details
    );
  }

  // PostgreSQL unique violation
  if (error.code === "23505") {
    return failure(
      res,
      "CONFLICT",
      "A record with the provided value already exists",
      409
    );
  }

  // PostgreSQL foreign key violation
  if (error.code === "23503") {
    return failure(
      res,
      "VALIDATION_ERROR",
      "Referenced resource does not exist",
      400
    );
  }

  // PostgreSQL check constraint violation
  if (error.code === "23514") {
    return failure(
      res,
      "VALIDATION_ERROR",
      "Database constraint violation",
      400
    );
  }

  return failure(
    res,
    "INTERNAL_ERROR",
    "Internal server error",
    500
  );
}

module.exports = errorHandler;