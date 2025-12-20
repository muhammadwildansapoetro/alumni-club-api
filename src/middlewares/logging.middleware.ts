import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Generate unique request ID
const getRequestId = () => crypto.randomBytes(16).toString('hex');

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Only log in development or for errors in production
  if (process.env.NODE_ENV === 'development') {
    const requestId = getRequestId();
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const user = (req as any).user?.id || 'anonymous';

    // Add request ID to request object for tracking
    (req as any).requestId = requestId;

    // Log request start (only in development)
    console.log(`[${timestamp}] [${requestId}] ${req.method} ${req.originalUrl}`, {
      ip,
      userAgent,
      user,
      query: req.query,
      params: req.params,
      // Don't log sensitive request body
      ...(req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH' && { body: req.body })
    });
  }

  // Track start time for response time measurement
  (req as any).startTime = Date.now();

  // Override res.end to log response (only errors in production)
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - (req as any).startTime;
    const statusCode = res.statusCode;

    // Always log errors, only log all responses in development
    if (statusCode >= 400 || process.env.NODE_ENV === 'development') {
      const requestId = (req as any).requestId || 'unknown';
      const user = (req as any).user?.id || 'anonymous';
      const ip = req.ip || req.socket.remoteAddress || 'Unknown';

      console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.originalUrl} - ${statusCode}`, {
        responseTime: `${responseTime}ms`,
        statusCode,
        ip,
        user
      });
    }

    // Call original end with correct signature
    return originalEnd(chunk, encoding, cb);
  };
  next();
};

