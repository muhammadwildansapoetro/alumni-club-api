import type { Request, Response } from "express";
import {
  registerService,
  loginService,
  verifyEmailService,
  resendVerificationService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
} from "../services/auth.service.js";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "../types/auth.types.js";

/**
 * Register a new user with email and password
 */
export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, name, department, classYear }: RegisterInput = req.body;

    const result = await registerService(email, password, name, department, classYear);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Registrasi gagal. Silakan coba lagi.",
    });
  }
};

/**
 * Login user with email and password
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body;

    const result = await loginService(email, password);

    return res.json({
      success: true,
      message: "Login berhasil.",
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Login gagal. Silakan coba lagi.",
    });
  }
};

/**
 * Verify email with token
 */
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;

    const result = await verifyEmailService(token);

    return res.json(result);
  } catch (error: any) {
    console.error("Email verification error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Verifikasi email gagal.",
    });
  }
};

/**
 * Resend email verification
 */
export const resendVerificationController = async (req: Request, res: Response) => {
  try {
    const { email }: ResendVerificationInput = req.body;

    const result = await resendVerificationService(email);

    return res.json(result);
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Gagal mengirim ulang email verifikasi.",
    });
  }
};

/**
 * Request password reset
 */
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email }: ForgotPasswordInput = req.body;

    const result = await forgotPasswordService(email);

    return res.json(result);
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Gagal memproses permintaan reset password.",
    });
  }
};

/**
 * Reset password with token
 */
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, password }: ResetPasswordInput = req.body;

    const result = await resetPasswordService(token, password);

    return res.json(result);
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Reset password gagal.",
    });
  }
};

/**
 * Change password for authenticated user
 */
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword }: ChangePasswordInput = req.body;
    const userId = (req as any).user.id; // User ID from auth middleware

    const result = await changePasswordService(userId, currentPassword, newPassword);

    return res.json(result);
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Gagal mengubah password.",
    });
  }
};
