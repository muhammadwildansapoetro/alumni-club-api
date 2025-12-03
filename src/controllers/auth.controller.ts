import type { Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../types/auth.types.js";
import {
  ConflictError,
  UnauthorizedError,
  handleAuthError
} from "../utils/errors.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await registerService(body);

    return res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: "Input tidak valid",
        details: err.errors
      });
    }

    if (err.message.includes("sudah terdaftar")) {
      return handleAuthError(new ConflictError(err.message), res);
    }

    return handleAuthError(err, res);
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    const { user, token } = await loginService(body);

    return res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authProvider: user.authProvider
        },
        token,
        expiresIn: "7d"
      }
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: "Input tidak valid",
        details: err.errors
      });
    }

    if (err.message.includes("salah") || err.message.includes("tidak ditemukan")) {
      return handleAuthError(new UnauthorizedError(err.message), res);
    }

    if (err.message.includes("Google")) {
      return handleAuthError(new ConflictError(err.message), res);
    }

    return handleAuthError(err, res);
  }
};
