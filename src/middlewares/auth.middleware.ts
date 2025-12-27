import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest, UserRole } from "../types/express.types.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token tidak ditemukan",
    });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing");
    return res.status(500).json({
      success: false,
      error: "Server misconfiguration",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    next();
  } catch (err) {
    console.error("JWT verify failed:", err);

    return res.status(401).json({
      success: false,
      error: "Token tidak valid atau kadaluarsa",
    });
  }
};
