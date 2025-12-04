import rateLimit from "express-rate-limit";

// General rate limiting for all API endpoints
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Terlalu banyak permintaan, silakan coba lagi nanti",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes instead of 15
  max: 15, // 15 attempts instead of 5
  message: {
    success: false,
    error: "Terlalu banyak percobaan, silakan coba lagi dalam 5 menit",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiting for file upload endpoints
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: "Terlalu banyak unggahan file, silakan coba lagi dalam 1 jam",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for admin operations
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 admin requests per windowMs
  message: {
    success: false,
    error: "Terlalu banyak operasi admin, silakan coba lagi nanti",
  },
  standardHeaders: true,
  legacyHeaders: false,
});