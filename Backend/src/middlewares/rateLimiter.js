
import rateLimit from 'express-rate-limit';

// general API limiter that ensures —> 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    statusCode: 429,
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});


// stricter limiter for auth endpoints that ensures 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    statusCode: 429,
  },
  
 
});

export { apiLimiter, authLimiter };
