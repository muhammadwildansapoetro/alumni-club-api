import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/express.types.js";
import { UserRole } from "../types/express.types.js";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Tidak terautentikasi - Pengguna tidak ditemukan"
    });
  }

  if (user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      error: "Akses ditolak - Diperlukan hak akses admin"
    });
  }

  next();
};