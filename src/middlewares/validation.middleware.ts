import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../types/express.types.js";
import type { z } from "zod";

// Generic validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.issues) {
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: "Validasi gagal",
          details: validationErrors
        } as ApiResponse);
      }
      next(error);
    }
  };
};