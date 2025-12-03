import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RegisterInput, LoginInput } from "../types/auth.types.js";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES = "7d";

export const registerService = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    if (existing.authProvider === "GOOGLE") {
      throw new Error(
        "Email sudah terdaftar dengan Google. Silakan login dengan Google."
      );
    }
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create User and AlumniProfile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create User first
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        authProvider: "EMAIL",
        role: "USER",
      },
    });

    // Create AlumniProfile
    const alumniProfile = await tx.alumniProfile.create({
      data: {
        userId: user.id,
        fullName: data.name,
        department: data.department,
        classYear: data.classYear,
      },
    });

    return { user, alumniProfile };
  });

  return result;
};

export const loginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      profile: true,
    },
  });

  if (!user) throw new Error("Email atau password salah");

  if (user.authProvider === "GOOGLE") {
    throw new Error(
      "Email ini terdaftar dengan Google. Silakan login dengan Google."
    );
  }

  if (!user.password) {
    throw new Error("Password tidak ditemukan. Silakan login dengan Google.");
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);

  if (!passwordMatch) throw new Error("Email atau password salah");

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return { user, token };
};
