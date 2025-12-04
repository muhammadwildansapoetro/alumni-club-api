import type { Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../types/auth.types.js";
import {
  ConflictError,
  UnauthorizedError,
  handleAuthError,
} from "../utils/errors.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerService(body);

    return res.status(201).json({
      success: true,
      message:
        "Pendaftaran alumni berhasil! Selamat bergabung dengan FTIP Unpad Alumni Club.",
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          authProvider: result.user.authProvider,
          createdAt: result.user.createdAt,
        },
        alumniProfile: {
          id: result.alumniProfile.id,
          fullName: result.alumniProfile.fullName,
          department: result.alumniProfile.department,
          classYear: result.alumniProfile.classYear,
          createdAt: result.alumniProfile.createdAt,
        },
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Input tidak valid",
        details: err.errors,
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
      message: "Login berhasil! Selamat datang kembali.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authProvider: user.authProvider,
          profile: user.profile
            ? {
                fullName: user.profile.fullName,
                department: user.profile.department,
                classYear: user.profile.classYear,
                city: user.profile.city,
                industry: user.profile.industry,
                employmentLevel: user.profile.employmentLevel,
                jobTitle: user.profile.jobTitle,
                companyName: user.profile.companyName,
              }
            : null,
        },
        token,
        expiresIn: "1d",
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Input tidak valid",
        details: err.errors,
      });
    }

    if (
      err.message.includes("salah") ||
      err.message.includes("tidak ditemukan")
    ) {
      return handleAuthError(new UnauthorizedError(err.message), res);
    }

    if (err.message.includes("Google")) {
      return handleAuthError(new ConflictError(err.message), res);
    }

    return handleAuthError(err, res);
  }
};
