import { prisma } from "../lib/prisma.ts";
import csv from "csv-parser";
import fs from "fs";
import type { UserRole } from "../../generated/prisma/index.js";

// Interface untuk CSV import
interface AlumniCSVRow {
  email: string;
  name: string;
  npm: string;
  fullName?: string;
  department: string;
  classYear: string;
  role?: string;
}

// READ - Ambil semua pengguna (hanya admin)
export const getAllUsersService = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            department: true,
            classYear: true,
            city: true,
            industry: true,
            employmentLevel: true,
            jobTitle: true,
            companyName: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({
      where: {
        deletedAt: null,
      },
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// READ - Ambil pengguna berdasarkan ID (semua pengguna bisa lihat)
export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          department: true,
          classYear: true,
          city: true,
          industry: true,
          employmentLevel: true,
          incomeRange: true,
          jobTitle: true,
          companyName: true,
          linkedInUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  return user;
};

// READ - Ambil direktori alumni untuk dashboard (semua pengguna bisa akses)
export const getAlumniDirectoryService = async (
  page: number = 1,
  limit: number = 10,
  department?: string,
  classYear?: number,
  city?: string,
  industry?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;

  // Build filter conditions
  const whereCondition: any = {
    deletedAt: null,
    profile: {
      isNot: null,
    },
  };

  // Add profile filters
  const profileFilter: any = {};
  if (department) profileFilter.department = department;
  if (classYear) profileFilter.classYear = classYear;
  if (city) profileFilter.city = { contains: city, mode: "insensitive" };
  if (industry) profileFilter.industry = industry;

  // Search by name or email
  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { profile: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (Object.keys(profileFilter).length > 0) {
    whereCondition.profile = profileFilter;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            fullName: true,
            department: true,
            classYear: true,
            city: true,
            industry: true,
            employmentLevel: true,
            jobTitle: true,
            companyName: true,
            linkedInUrl: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// UPDATE - Perbarui peran pengguna (hanya admin)
export const updateUserRoleService = async (userId: string, role: UserRole) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("Pengguna tidak ditemukan");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          department: true,
          classYear: true,
        },
      },
      updatedAt: true,
    },
  });

  return updatedUser;
};

// UPDATE - Perbarui profil pengguna (hanya pemilik profil atau admin)
export const updateUserProfileService = async (
  userId: string,
  data: {
    email?: string;
    name?: string;
    profile?: {
      fullName?: string;
      city?: string;
      industry?: any;
      employmentLevel?: any;
      incomeRange?: any;
      jobTitle?: string;
      companyName?: string;
      linkedInUrl?: string;
    };
  },
  requestingUserId: string,
  requestingUserRole: UserRole
) => {
  // Periksa apakah pengguna memiliki izin (pemilik profil atau admin)
  const isOwner = requestingUserId === userId;
  const isAdmin = requestingUserRole === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new Error(
      "Akses ditolak - Anda hanya dapat memperbarui profil Anda sendiri"
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("Pengguna tidak ditemukan");
  }

  // Validasi email uniqueness jika email akan diupdate
  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        id: { not: userId }, // Exclude current user
        deletedAt: null,
      },
    });

    if (emailExists) {
      throw new Error("Email sudah terdaftar");
    }
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    // Perbarui info dasar pengguna
    const userUpdate: any = {};
    if (data.name !== undefined) userUpdate.name = data.name;
    if (data.email !== undefined) userUpdate.email = data.email.toLowerCase();

    const updatedUserObj = await tx.user.update({
      where: { id: userId },
      data: userUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Perbarui profil alumni jika disediakan
    if (data.profile) {
      const existingProfile = await tx.alumniProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        await tx.alumniProfile.update({
          where: { userId },
          data: data.profile,
        });
      } else {
        // Buat profil jika tidak ada
        await tx.alumniProfile.create({
          data: {
            userId,
            npm: "0000000000000", // Default value - should be updated later
            fullName: data.profile.fullName || updatedUserObj.name || "",
            department: "TEP", // Default value
            classYear: new Date().getFullYear(), // Default value
            ...data.profile,
          },
        });
      }
    }

    return updatedUserObj;
  });

  return updatedUser;
};


// DELETE - Soft delete pengguna (hanya admin)
export const softDeleteUserService = async (userId: string) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("Pengguna tidak ditemukan");
  }

  // Cegah admin menghapus dirinya sendiri
  if (existingUser.role === "ADMIN") {
    throw new Error("Admin tidak dapat menghapus akun admin lain");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  return { message: "Pengguna berhasil dihapus" };
};

// RESTORE - Pulihkan pengguna yang dihapus (hanya admin)
export const restoreUserService = async (userId: string) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: { not: null },
    },
  });

  if (!existingUser) {
    throw new Error("Pengguna yang dihapus tidak ditemukan");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });

  return { message: "Pengguna berhasil dipulihkan" };
};

// READ - Ambil pengguna yang dihapus (hanya admin)
export const getDeletedUsersService = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        deletedAt: { not: null },
      },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deletedAt: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            department: true,
            classYear: true,
          },
        },
        createdAt: true,
      },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.user.count({
      where: {
        deletedAt: { not: null },
      },
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// CREATE - Buat pengguna baru (hanya admin)
export const createUserService = async (data: {
  email: string;
  name: string;
  role: UserRole;
  npm: string;
  department: string;
  classYear: number;
  fullName?: string;
}) => {
  // Cek apakah email sudah ada
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create User
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
      },
    });

    // Create AlumniProfile
    const alumniProfile = await tx.alumniProfile.create({
      data: {
        userId: user.id,
        npm: data.npm,
        fullName: data.fullName || data.name,
        department: data.department as any,
        classYear: data.classYear,
      },
    });

    return { user, alumniProfile };
  });

  return result;
};

// BULK CREATE - Import alumni dari CSV (hanya admin)
export const importAlumniFromCSVService = async (
  filePath: string
): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const results: AlumniCSVRow[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        try {
          // Validasi header CSV
          if (results.length === 0) {
            reject(new Error("File CSV kosong"));
            return;
          }

          // Validasi format header
          const firstRow = results[0];
          if (!firstRow) {
            reject(new Error("File CSV tidak memiliki header yang valid"));
            return;
          }

          const requiredFields = ["email", "name", "npm", "department", "classYear"];
          const missingFields = requiredFields.filter(
            (field) => !(field in firstRow)
          );

          if (missingFields.length > 0) {
            reject(
              new Error(
                `Field wajib tidak ditemukan: ${missingFields.join(", ")}`
              )
            );
            return;
          }

          // Proses setiap baris
          for (let i = 0; i < results.length; i++) {
            try {
              const row = results[i];
              const rowNum = i + 2; // +2 karena CSV dimulai dari baris 2 (setelah header)

              // Validasi data
              if (
                !row?.email ||
                !row?.name ||
                !row?.npm ||
                !row?.department ||
                !row?.classYear
              ) {
                errors.push(`Baris ${rowNum}: Data tidak lengkap`);
                failedCount++;
                continue;
              }

              // Validasi email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(row.email)) {
                errors.push(`Baris ${rowNum}: Email tidak valid: ${row.email}`);
                failedCount++;
                continue;
              }

              // Validasi department
              const validDepartments = ["TEP", "TPN", "TIN"];
              if (!validDepartments.includes(row.department.toUpperCase())) {
                errors.push(
                  `Baris ${rowNum}: Department tidak valid. Harus salah satu dari: ${validDepartments.join(
                    ", "
                  )}`
                );
                failedCount++;
                continue;
              }

              // Validasi classYear
              const classYear = parseInt(row.classYear);
              if (
                isNaN(classYear) ||
                classYear < 1960 ||
                classYear > new Date().getFullYear()
              ) {
                errors.push(
                  `Baris ${rowNum}: Tahun angkatan tidak valid: ${row.classYear}`
                );
                failedCount++;
                continue;
              }

              // Validasi NPM
              if (!/^\d{1,13}$/.test(row.npm)) {
                errors.push(
                  `Baris ${rowNum}: NPM tidak valid: ${row.npm}. Harus berupa angka maksimal 13 digit`
                );
                failedCount++;
                continue;
              }

              // Validasi role jika ada
              let role: UserRole = "USER";
              if (row.role) {
                const validRoles = ["USER", "ADMIN"];
                if (!validRoles.includes(row.role.toUpperCase())) {
                  errors.push(
                    `Baris ${rowNum}: Role tidak valid. Harus USER atau ADMIN`
                  );
                  failedCount++;
                  continue;
                }
                role = row.role.toUpperCase() as UserRole;
              }

              // Cek apakah email sudah ada
              const existingUser = await prisma.user.findUnique({
                where: { email: row.email },
              });

              if (existingUser) {
                errors.push(
                  `Baris ${rowNum}: Email sudah terdaftar: ${row.email}`
                );
                failedCount++;
                continue;
              }

              // Create user dan alumni profile
              await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                  data: {
                    email: row.email,
                    name: row.name,
                    role: role,
                  },
                });

                await tx.alumniProfile.create({
                  data: {
                    userId: user.id,
                    npm: row.npm,
                    fullName: row.fullName || row.name,
                    department: row.department.toUpperCase() as any,
                    classYear: classYear,
                  },
                });
              });

              successCount++;
            } catch (error) {
              errors.push(
                `Baris ${i + 2}: ${
                  error instanceof Error
                    ? error.message
                    : "Error tidak diketahui"
                }`
              );
              failedCount++;
            }
          }

          resolve({
            success: successCount,
            failed: failedCount,
            errors,
          });
        } catch (error) {
          reject(error);
        } finally {
          // Hapus file CSV setelah diproses
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error("Gagal menghapus file:", error);
          }
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

// Validasi template CSV
export const validateCSVTemplateService = async (
  filePath: string
): Promise<{
  isValid: boolean;
  message: string;
  sampleData?: any;
}> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        if (results.length === 0) {
          resolve({
            isValid: false,
            message: "File CSV kosong",
          });
          return;
        }

        const firstRow = results[0];
        if (!firstRow) {
          resolve({
            isValid: false,
            message: "File CSV tidak memiliki data yang valid",
          });
          return;
        }

        const requiredFields = ["email", "name", "department", "classYear"];
        const optionalFields = ["fullName", "role"];

        const missingFields = requiredFields.filter(
          (field) => !(field in firstRow)
        );
        const extraFields = Object.keys(firstRow).filter(
          (field) =>
            !requiredFields.includes(field) && !optionalFields.includes(field)
        );

        if (missingFields.length > 0) {
          resolve({
            isValid: false,
            message: `Field wajib tidak ditemukan: ${missingFields.join(", ")}`,
          });
          return;
        }

        if (extraFields.length > 0) {
          resolve({
            isValid: false,
            message: `Field tidak dikenal: ${extraFields.join(", ")}`,
          });
          return;
        }

        resolve({
          isValid: true,
          message: "Template CSV valid",
          sampleData: firstRow,
        });

        // Hapus file setelah validasi
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error("Gagal menghapus file:", error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
