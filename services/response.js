const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data != null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error && process.env.NODE_ENV === "development") {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  sendError,
  sendSuccess,
  asyncHandler,
};
