import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/express.types.js";
import { prisma } from "../lib/prisma.ts";

// Factory function to create owner middleware for different resources
export const createOwnerMiddleware = (resourceType: "job" | "business") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as AuthenticatedRequest).user;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID tidak boleh kosong",
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User tidak terautentikasi",
        });
      }

      // Admin can access everything
      if (user.role === "ADMIN") {
        return next();
      }

      let resource;
      if (resourceType === "job") {
        resource = await prisma.jobs.findFirst({
          where: {
            id,
            userId: user.id,
          },
        });
      } else if (resourceType === "business") {
        resource = await prisma.business.findFirst({
          where: {
            id,
            userId: user.id,
          },
        });
      }

      if (!resource) {
        return res.status(403).json({
          success: false,
          error:
            "Akses ditolak - Anda hanya dapat mengubah resource yang Anda buat",
        });
      }

      next();
    } catch (error) {
      console.error("Error di owner middleware:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan internal",
      });
    }
  };
};

export const jobOwnerMiddleware = createOwnerMiddleware("job");
export const businessOwnerMiddleware = createOwnerMiddleware("business");
