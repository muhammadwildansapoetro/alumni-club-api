export class AuthError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 400,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ConflictError extends AuthError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class InternalServerError extends AuthError {
  constructor(message: string = "Terjadi kesalahan pada server") {
    super(message, 500, false);
  }
}

export const handleAuthError = (err: any, res: any) => {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.constructor.name,
    });
  }

  // Log unexpected errors
  console.error("Unexpected error:", err);

  return res.status(500).json({
    success: false,
    error: "Terjadi kesalahan pada server",
    code: "INTERNAL_ERROR",
  });
};
