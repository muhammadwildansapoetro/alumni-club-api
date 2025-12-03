import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RegisterInput, LoginInput } from "../types/auth.types.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
const JWT_EXPIRES = "7d";

export const registerService = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    if (existing.authProvider === 'GOOGLE') {
      throw new Error("Email sudah terdaftar dengan Google. Silakan login dengan Google.");
    }
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      authProvider: 'EMAIL',
      role: "USER",
    },
  });

  return user;
};

export const loginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) throw new Error("Email atau password salah");

  if (user.authProvider === 'GOOGLE') {
    throw new Error("Email ini terdaftar dengan Google. Silakan login dengan Google.");
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
