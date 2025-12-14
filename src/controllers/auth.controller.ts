import type { Request, Response } from "express";
// Email/password authentication is disabled - Google auth only
// import { registerService, loginService } from "../services/auth.service.js";
// import { registerSchema, loginSchema } from "../types/auth.types.js";

export const registerController = async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    message: "Email/password registration is not supported. Please use Google authentication.",
  });
};

export const loginController = async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    message: "Email/password login is not supported. Please use Google authentication.",
  });
};
