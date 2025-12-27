import type { Request, RequestHandler, Response } from "express";
import type { AuthenticatedRequest } from "../types/express.types.js";
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateOwnProfileService,
  softDeleteUserService,
} from "../services/user.service.js";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { email, name, role, npm, department, classYear, fullName } =
      req.body;

    const result = await createUserService({
      email: email.toLowerCase(),
      name,
      role: role === "ADMIN" ? "ADMIN" : "USER",
      npm,
      department: department.toUpperCase(),
      classYear,
      fullName,
    });

    res.status(201).json({
      success: true,
      message: "Berhasil membuat pengguna baru",
      data: result,
    });
  } catch (error) {
    console.error("Error di createUserController:", error);
    if (error instanceof Error && error.message === "Email sudah terdaftar") {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// ============================================
// GET ALL USERS (All authenticated users)
// ============================================
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const classYear = req.query.classYear
      ? parseInt(req.query.classYear as string)
      : undefined;
    const cityId = req.query.cityId
      ? parseInt(req.query.cityId as string)
      : undefined;
    const provinceId = req.query.provinceId
      ? parseInt(req.query.provinceId as string)
      : undefined;
    const countryId = req.query.countryId
      ? parseInt(req.query.countryId as string)
      : undefined;
    const industry = req.query.industry as string;
    const jobLevel = req.query.jobLevel as string;
    const status = req.query.status as string;

    const result = await getAllUsersService(
      page,
      limit,
      search,
      department,
      classYear,
      cityId,
      provinceId,
      countryId,
      industry,
      jobLevel,
      status
    );

    res.json({
      success: true,
      message: "Berhasil mengambil daftar pengguna",
      data: result,
    });
  } catch (error) {
    console.error("Error di getAllUsersController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "ID tidak boleh kosong" });
    }

    const result = await getUserByIdService(id);

    res.json({
      success: true,
      message: "Berhasil mengambil data pengguna",
      data: result,
    });
  } catch (error) {
    console.error("Error di getUserByIdController:", error);
    if (
      error instanceof Error &&
      error.message === "Pengguna tidak ditemukan"
    ) {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

export const updateOwnProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { profile } = req.body;

    const updatedProfile = await updateOwnProfileService(user.id, profile);

    res.json({
      success: true,
      message: "Berhasil memperbarui profil",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error("Error di updateOwnProfileController:", error);
    if (
      error instanceof Error &&
      error.message === "Pengguna tidak ditemukan"
    ) {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

export const softDeleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "ID tidak boleh kosong" });
    }

    const user = (req as AuthenticatedRequest).user;
    const result = await softDeleteUserService(id, user.id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error di softDeleteUserController:", error);
    const statusCode =
      error instanceof Error &&
      (error.message === "Pengguna tidak ditemukan" ||
        error.message === "Admin tidak dapat menghapus akun admin lain" ||
        error.message === "Admin tidak dapat menghapus akun sendiri")
        ? 403
        : 500;

    res.status(statusCode).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

export const getMyProfileController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await getUserByIdService(userId);

  res.json({
    success: true,
    data: result,
  });
};
