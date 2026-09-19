function success(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    data,
    error: null
  });
}

function failure(
  res,
  code,
  message,
  statusCode = 500,
  details = null
) {
  return res.status(statusCode).json({
    data: null,
    error: {
      code,
      message,
      ...(details !== null ? { details } : {})
    }
  });
}

module.exports = {
  success,
  failure
};