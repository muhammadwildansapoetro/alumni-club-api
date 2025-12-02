import type { Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../types/auth.types.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await registerService(body);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    const { user, token } = await loginService(body);

    return res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
