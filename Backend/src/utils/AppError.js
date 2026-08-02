class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    Error.captureStackTrace(this, this.constructor); //a stack trace tells us what error took place and which function led to it.
  }
}

export default AppError;

//here we have a defined a standard format for reporting the errors that occur in the backend


// Controller detects problem
//         ↓
// Creates / throws AppError
//         ↓
// Global error middleware receives it
//         ↓
// Middleware sends one standard JSON error response