import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Generate unique request ID
const getRequestId = () => crypto.randomBytes(16).toString('hex');

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate request ID for tracking (without logging)
  const requestId = getRequestId();
  (req as any).requestId = requestId;

  // Track start time for response time measurement
  (req as any).startTime = Date.now();

  // Override res.end to capture response time (without logging)
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - (req as any).startTime;

    // Store response data on request object if needed for other middleware
    (req as any).responseTime = responseTime;
    (req as any).statusCode = res.statusCode;

    // Call original end with correct signature
    return originalEnd(chunk, encoding, cb);
  };
  next();
};

