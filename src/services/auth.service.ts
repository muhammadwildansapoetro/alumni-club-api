import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { encrypt } from '../lib/encryption.js';
import {
  hashPassword,
  comparePassword,
  generateVerificationToken,
  generatePasswordResetToken,
  generateTokenExpiration
} from '../lib/password.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} from './email.service.js';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
const JWT_EXPIRES = "7d";

/**
 * Register a new user with email and password
 * @param email User email
 * @param password User password
 * @param name User name
 * @param npm Student ID number
 * @param department Department (TEP, TPN, TIN)
 * @param classYear Class year
 * @returns User and encrypted JWT token
 */
export const registerService = async (
  email: string,
  password: string,
  name: string,
  npm: string,
  department: "TEP" | "TPN" | "TIN",
  classYear: number
) => {
  // Check if user already exists with email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.authMethod === "GOOGLE") {
      throw new Error(
        "Email sudah terdaftar dengan Google OAuth. Silakan login dengan Google atau hubungi admin untuk menghubungkan akun."
      );
    }
    throw new Error("Email sudah terdaftar. Silakan login.");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = generateTokenExpiration(24); // 24 hours

  // Create user and alumni profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create User
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        authMethod: "EMAIL",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        role: "USER",
      },
    });

    // Create AlumniProfile
    const alumniProfile = await tx.alumniProfile.create({
      data: {
        userId: newUser.id,
        npm,
        fullName: name,
        department,
        classYear,
      },
    });

    return { user: newUser, profile: alumniProfile };
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, name, verificationToken);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't throw error here, user can request resend
  }

  return {
    success: true,
    message: "Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.",
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      emailVerified: result.user.emailVerified,
      profile: result.profile,
    }
  };
};

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns User and encrypted JWT token
 */
export const loginService = async (email: string, password: string) => {
  // Find user with email
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    throw new Error("Email atau password tidak valid.");
  }

  // Check authentication method
  if (user.authMethod === "GOOGLE" && !user.password) {
    throw new Error(
      "Email ini terdaftar dengan Google OAuth. Silakan login dengan Google."
    );
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new Error(
      "Email Anda belum diverifikasi. Silakan periksa email Anda atau minta verifikasi ulang."
    );
  }

  // Check if password exists and compare
  if (!user.password) {
    throw new Error("Password tidak ditemukan. Silakan reset password Anda.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Email atau password tidak valid.");
  }

  // Generate JWT token
  const rawToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      authMethod: user.authMethod,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  // Encrypt token for secure transmission
  const encryptedToken = encrypt(rawToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: user.authMethod,
      profile: user.profile,
    },
    token: encryptedToken
  };
};

/**
 * Verify email with token
 * @param token Email verification token
 * @returns Success message and user data
 */
export const verifyEmailService = async (token: string) => {
  // Find user with verification token
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date(), // Token not expired
      },
    },
    include: { profile: true },
  });

  if (!user) {
    throw new Error(
      "Token verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta verifikasi email baru."
    );
  }

  // Update user verification status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
    include: { profile: true },
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name || "Alumni");
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return {
    success: true,
    message: "Email berhasil diverifikasi! Anda sekarang dapat login.",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerified: updatedUser.emailVerified,
      profile: updatedUser.profile,
    }
  };
};

/**
 * Resend email verification
 * @param email User email
 * @returns Success message
 */
export const resendVerificationService = async (email: string) => {
  // Find user with email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email tidak ditemukan. Silakan registrasi terlebih dahulu.");
  }

  if (user.authMethod === "GOOGLE") {
    throw new Error(
      "Email ini terdaftar dengan Google OAuth dan tidak memerlukan verifikasi."
    );
  }

  if (user.emailVerified) {
    throw new Error("Email Anda sudah diverifikasi. Silakan login.");
  }

  // Generate new verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = generateTokenExpiration(24);

  // Update user with new token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, user.name || "Alumni", verificationToken);

  return {
    success: true,
    message: "Email verifikasi telah dikirim ulang. Silakan periksa inbox Anda.",
  };
};

/**
 * Request password reset
 * @param email User email
 * @returns Success message
 */
export const forgotPasswordService = async (email: string) => {
  // Find user with email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration attacks
  if (!user) {
    return {
      success: true,
      message: "Jika email terdaftar, Anda akan menerima link reset password.",
    };
  }

  // Check authentication method
  if (user.authMethod === "GOOGLE" && !user.password) {
    return {
      success: true,
      message: "Jika email terdaftar, Anda akan menerima link reset password.",
    };
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken();
  const resetExpires = generateTokenExpiration(1); // 1 hour

  // Update user with reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, user.name || "Alumni", resetToken);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }

  return {
    success: true,
    message: "Jika email terdaftar, Anda akan menerima link reset password.",
  };
};

/**
 * Reset password with token
 * @param token Password reset token
 * @param newPassword New password
 * @returns Success message
 */
export const resetPasswordService = async (token: string, newPassword: string) => {
  // Find user with reset token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new Error(
      "Token reset password tidak valid atau sudah kedaluwarsa. Silakan minta reset password baru."
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return {
    success: true,
    message: "Password berhasil direset. Silakan login dengan password baru Anda.",
  };
};

/**
 * Change password for authenticated user
 * @param userId User ID
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Success message
 */
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Find user with ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User tidak ditemukan.");
  }

  // Check if user has password
  if (!user.password) {
    throw new Error(
      "Akun ini menggunakan Google OAuth. Tidak dapat mengubah password."
    );
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new Error("Password saat ini tidak valid.");
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    success: true,
    message: "Password berhasil diubah.",
  };
};