
import { validationResult} from 'express-validator';
import AppError from '../utils/AppError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(new AppError('Validation failed', 422, formattedErrors));
  }

  next();
};

export default validate;


// Client sends request
//       ↓
// Validator rules check fields
//       ↓
// validate.middleware.js checks validation results
//       ↓
// Invalid → sendError() returns 400 response
// Valid → next() sends request to controller


// Example->

// Client sends POST /api/auth/register
//         ↓
// auth.validator.js checks email, password, name, etc.
//         ↓
// express-validator stores validation errors on this request
//         ↓
// validate.middleware.js calls validationResult(req)
//         ↓
// Invalid → creates AppError with status 422
//         ↓
// error.middleware.js sends formatted error response
//         ↓
// Valid → next() moves to auth.controller.js
