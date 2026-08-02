
const sendSuccess = (res, statusCode, message, data = {}, extras = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extras,
  });
};

const sendError = (res, statusCode, message, errors = []) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    statusCode,
  });
};

export { sendSuccess, sendError };
