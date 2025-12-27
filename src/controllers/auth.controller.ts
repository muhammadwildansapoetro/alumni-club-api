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
import jwt from "jsonwebtoken";
import { signAccessToken } from "../utils/token.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, name, npm, department, classYear }: RegisterInput =
      req.body;

    const result = await registerService(
      email,
      password,
      name,
      npm,
      department,
      classYear
    );

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Registrasi gagal. Silakan coba lagi.",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body;

    const result = await loginService(email, password);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({
      success: true,
      message: "Login berhasil.",
      user: result.user,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Login gagal. Silakan coba lagi.",
    });
  }
};

export const refreshController = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ success: false });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string; role: string };

    const newAccessToken = signAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 15,
    });

    res.json({ success: true });
  } catch {
    return res.status(401).json({ success: false });
  }
};

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

export const resendVerificationController = async (
  req: Request,
  res: Response
) => {
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

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword }: ChangePasswordInput = req.body;
    const userId = (req as any).user.id; // User ID from auth middleware

    const result = await changePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Gagal mengubah password.",
    });
  }
};
