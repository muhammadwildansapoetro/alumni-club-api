import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { decrypt } from "../lib/encryption.js";
import type { AuthenticatedRequest, UserRole } from "../types/express.types.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token tidak ditemukan"
    });
  }

  try {
    // Try to decrypt token first (in case it's encrypted from frontend)
    let decryptedToken = token;
    try {
      decryptedToken = decrypt(token);
    } catch (decryptError) {
      // If decryption fails, assume token is not encrypted
      console.log('Token is not encrypted, using as-is');
    }

    const decoded = jwt.verify(decryptedToken, JWT_SECRET) as {
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
    return res.status(401).json({
      success: false,
      error: "Token tidak valid"
    });
  }
};
