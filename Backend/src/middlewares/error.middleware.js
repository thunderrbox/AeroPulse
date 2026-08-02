import AppError from "../utils/AppError.js";


const handleMongooseCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleMongooseDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`${field} '${value}' already exists.`, 409);
};

const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Database validation failed', 422, errors);
};


//middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err }; //spreading and copying the properties from err in to a new JS object "error"
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errors = err.errors || [];

  if (err.name === 'CastError') error = handleMongooseCastError(err);
  if (err.code === 11000) error = handleMongooseDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleMongooseValidationError(err);




  const response = {
    success: false,
    message: error.message || 'Internal Server Error',
    statusCode: error.statusCode,
    errors: error.errors,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

//middleware
const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

export { globalErrorHandler, notFound };
