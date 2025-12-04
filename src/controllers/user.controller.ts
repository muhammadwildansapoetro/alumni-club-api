import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/express.types.js";
import {
  getAllUsersService,
  getUserByIdService,
  getAlumniDirectoryService,
  updateUserRoleService,
  updateUserProfileService,
  updateUserPasswordService,
  softDeleteUserService,
  restoreUserService,
  getDeletedUsersService,
  createUserService,
  importAlumniFromCSVService,
  validateCSVTemplateService,
} from "../services/user.service.js";
import type { UserRole } from "../../generated/prisma/index.js";

// GET /api/users - Ambil semua pengguna (hanya admin)
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllUsersService(page, limit);

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

// GET /api/users/directory - Ambil direktori alumni (semua pengguna bisa akses)
export const getAlumniDirectoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const department = req.query.department as string;
    const classYear = req.query.classYear
      ? parseInt(req.query.classYear as string)
      : undefined;
    const city = req.query.city as string;
    const industry = req.query.industry as string;
    const search = req.query.search as string;

    const result = await getAlumniDirectoryService(
      page,
      limit,
      department,
      classYear,
      city,
      industry,
      search
    );

    res.json({
      success: true,
      message: "Berhasil mengambil direktori alumni",
      data: result,
    });
  } catch (error) {
    console.error("Error di getAlumniDirectoryController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// GET /api/users/:id - Ambil pengguna berdasarkan ID (semua pengguna bisa akses)
export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const user = await getUserByIdService(id);

    res.json({
      success: true,
      message: "Berhasil mengambil data pengguna",
      data: user,
    });
  } catch (error) {
    console.error("Error di getUserByIdController:", error);
    if (
      error instanceof Error &&
      error.message === "Pengguna tidak ditemukan"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// PUT /api/users/:id/role - Update peran pengguna (hanya admin)
export const updateUserRoleController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role harus USER atau ADMIN",
      });
    }

    const updatedUser = await updateUserRoleService(id, role as UserRole);

    res.json({
      success: true,
      message: "Berhasil memperbarui peran pengguna",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error di updateUserRoleController:", error);
    if (
      error instanceof Error &&
      error.message === "Pengguna tidak ditemukan"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// PATCH /api/users/:id/profile - Update profil pengguna (pemilik atau admin)
export const updateUserProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const user = (req as AuthenticatedRequest).user;
    const data = req.body;

    const updatedUser = await updateUserProfileService(
      id,
      data,
      user.id,
      user.role
    );

    res.json({
      success: true,
      message: "Berhasil memperbarui profil pengguna",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error di updateUserProfileController:", error);
    if (
      error instanceof Error &&
      (error.message === "Pengguna tidak ditemukan" ||
        error.message ===
          "Akses ditolak - Anda hanya dapat memperbarui profil Anda sendiri")
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// PUT /api/users/:id/password - Update kata sandi pengguna (pemilik atau admin)
export const updateUserPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Kata sandi baru minimal 8 karakter",
      });
    }

    // Jika bukan admin, wajib menyertakan currentPassword
    if (user.role !== "ADMIN" && !currentPassword) {
      return res.status(400).json({
        success: false,
        error: "Kata sandi saat ini diperlukan",
      });
    }

    const result = await updateUserPasswordService(
      id,
      currentPassword,
      newPassword,
      user.id,
      user.role
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error di updateUserPasswordController:", error);
    const statusCode =
      error instanceof Error &&
      (error.message === "Pengguna tidak ditemukan" ||
        error.message ===
          "Akses ditolak - Anda hanya dapat memperbarui kata sandi Anda sendiri" ||
        error.message === "Kata sandi saat ini diperlukan" ||
        error.message === "Kata sandi saat ini salah" ||
        error.message ===
          "Tidak dapat memperbarui kata sandi untuk pengguna Google")
        ? 400
        : 500;

    res.status(statusCode).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// DELETE /api/users/:id - Soft delete pengguna (hanya admin)
export const softDeleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const result = await softDeleteUserService(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error di softDeleteUserController:", error);
    const statusCode =
      error instanceof Error &&
      (error.message === "Pengguna tidak ditemukan" ||
        error.message === "Admin tidak dapat menghapus akun admin lain")
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// PUT /api/users/:id/restore - Pulihkan pengguna yang dihapus (hanya admin)
export const restoreUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const result = await restoreUserService(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error di restoreUserController:", error);
    if (
      error instanceof Error &&
      error.message === "Pengguna yang dihapus tidak ditemukan"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// GET /api/users/deleted - Ambil pengguna yang dihapus (hanya admin)
export const getDeletedUsersController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getDeletedUsersService(page, limit);

    res.json({
      success: true,
      message: "Berhasil mengambil daftar pengguna yang dihapus",
      data: result,
    });
  } catch (error) {
    console.error("Error di getDeletedUsersController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// POST /api/users - Buat pengguna baru (hanya admin)
export const createUserController = async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, department, classYear, fullName } =
      req.body;

    // Validasi input
    if (!email || !name || !department || !classYear) {
      return res.status(400).json({
        success: false,
        error: "Email, nama, department, dan classYear wajib diisi",
      });
    }

    if (password && password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password minimal 8 karakter",
      });
    }

    const validDepartments = ["TEP", "TPN", "TIN"];
    if (!validDepartments.includes(department.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: `Department harus salah satu dari: ${validDepartments.join(
          ", "
        )}`,
      });
    }

    const classYearNum = parseInt(classYear);
    if (
      isNaN(classYearNum) ||
      classYearNum < 1960 ||
      classYearNum > new Date().getFullYear()
    ) {
      return res.status(400).json({
        success: false,
        error: "Tahun angkatan tidak valid",
      });
    }

    const userRole: UserRole =
      role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    const result = await createUserService({
      email: email.toLowerCase(),
      name,
      password,
      role: userRole,
      department: department.toUpperCase(),
      classYear: classYearNum,
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
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// POST /api/users/import - Import alumni dari CSV (hanya admin)
export const importAlumniFromCSVController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "File CSV diperlukan",
      });
    }

    const filePath = req.file.path;

    const result = await importAlumniFromCSVService(filePath);

    res.json({
      success: true,
      message: "Import CSV selesai diproses",
      data: {
        berhasilDiimport: result.success,
        gagalDiimport: result.failed,
        totalData: result.success + result.failed,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error di importAlumniFromCSVController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// POST /api/users/validate-csv - Validasi template CSV (hanya admin)
export const validateCSVTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "File CSV diperlukan",
      });
    }

    const filePath = req.file.path;

    const result = await validateCSVTemplateService(filePath);

    res.json({
      success: result.isValid,
      message: result.message,
      ...(result.sampleData && { sampleData: result.sampleData }),
    });
  } catch (error) {
    console.error("Error di validateCSVTemplateController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};
