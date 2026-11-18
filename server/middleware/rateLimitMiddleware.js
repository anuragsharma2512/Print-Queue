import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for shopkeeper login attempts.
 * Limits repeated failed PIN guesses to prevent brute-force attacks.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for public student order submissions.
 */
export const orderSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many order submissions. Please wait a few minutes before trying again.',
  },
});
