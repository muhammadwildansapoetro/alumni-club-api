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

  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: "USER",
    },
  });

  return user;
};

export const loginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) throw new Error("Invalid email or password");

  const passwordMatch = await bcrypt.compare(data.password, user.password!);

  if (!passwordMatch) throw new Error("Invalid email or password");

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
