 
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function extractToken(req) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw ApiError.unauthenticated(
      "Authentication required. Provide a Bearer token."
    );
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email
    };

    next();
  } catch (error) {
    throw ApiError.unauthenticated(
      "Invalid or expired authentication token"
    );
  }
});

function authorize(...allowedRoles) {
  return function roleAuthorizationMiddleware(req, res, next) {
    if (!req.user) {
      return next(
        ApiError.unauthenticated("Authentication required")
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          "You do not have permission to perform this action"
        )
      );
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};