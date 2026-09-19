 
const ApiError = require("../utils/ApiError");

function validate(schema, source = "body") {
  return function validationMiddleware(req, res, next) {
    try {
      const parsed = schema.parse(req[source]);

      req[source] = parsed;

      next();
    } catch (error) {
      next(error);
    }
  };
}

function validateBody(schema) {
  return validate(schema, "body");
}

function validateParams(schema) {
  return validate(schema, "params");
}

function validateQuery(schema) {
  return validate(schema, "query");
}

function validateRequest({
  body,
  params,
  query
} = {}) {
  return function requestValidationMiddleware(req, res, next) {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }

      if (params) {
        req.params = params.parse(req.params);
      }

      if (query) {
        req.query = query.parse(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  validate,
  validateBody,
  validateParams,
  validateQuery,
  validateRequest
};