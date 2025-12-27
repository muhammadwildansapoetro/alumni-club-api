import type { Request, Response, NextFunction } from "express";
import type { ApiError } from "../types/express.types.js";

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: (req as any).user?.id || "anonymous",
  });

  // Prisma validation errors
  if (err.name === "PrismaClientValidationError") {
    const message = "Data yang dimasukkan tidak valid";
    error = { ...error, message, statusCode: 400 };
  }

  // Prisma unique constraint error
  if (
    err.name === "PrismaClientKnownRequestError" &&
    (err as any).code === "P2002"
  ) {
    const message = "Data sudah ada dalam sistem";
    error = { ...error, message, statusCode: 409 };
  }

  // Prisma record not found
  if (
    err.name === "PrismaClientKnownRequestError" &&
    (err as any).code === "P2025"
  ) {
    const message = "Data tidak ditemukan";
    error = { ...error, message, statusCode: 404 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Token tidak valid";
    error = { ...error, message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token telah kadaluarsa";
    error = { ...error, message, statusCode: 401 };
  }

  // Multer errors (file upload)
  if (err.name === "MulterError") {
    let message = "Error unggah file";

    switch ((err as any).code) {
      case "LIMIT_FILE_SIZE":
        message = "Ukuran file terlalu besar";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Terlalu banyak file";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "File tidak diharapkan";
        break;
      default:
        message = "Error unggah file";
    }

    error = { ...error, message, statusCode: 400 };
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    const message = "Validasi gagal";
    const details = (err as any).errors?.map((e: any) => ({
      field: e.path?.join(".") || "unknown",
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: message,
      details,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Terjadi kesalahan internal server",
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Rute ${req.originalUrl} tidak ditemukan`,
  });
};

// Async error wrapper
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
