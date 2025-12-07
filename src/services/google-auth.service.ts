import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
const JWT_EXPIRES = "7d";

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export const verifyGoogleToken = async (
  token: string
): Promise<GoogleUserInfo> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    return {
      id: payload.sub!,
      email: payload.email!,
      name: payload.name || payload.email?.split("@")[0] || "Google User",
      picture: payload.picture,
      email_verified: payload.email_verified || false,
    };
  } catch (error: any) {
    throw new Error(`Google token verification failed: ${error.message}`);
  }
};

export const googleAuthService = async (googleUserInfo: GoogleUserInfo) => {
  const { id: googleId, email, name } = googleUserInfo;

  if (!googleUserInfo.email_verified) {
    throw new Error("Email belum diverifikasi oleh Google");
  }

  // Check if user exists with Google ID
  let user = await prisma.user.findUnique({
    where: { googleId },
    include: { profile: true },
  });

  if (user) {
    // User exists with Google ID, login
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
  }

  // Check if user exists with same email but different auth provider
  user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (user) {
    if (user.authProvider === "EMAIL") {
      throw new Error(
        "Email sudah terdaftar dengan metode login biasa. Silakan login dengan password."
      );
    }

    // Update existing user with Google info (user was previously registered)
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId,
        name: name || user.name,
        authProvider: "GOOGLE",
      },
      include: { profile: true },
    });
  } else {
    // User not found in database - must register first
    throw new Error(
      "Email Anda belum terdaftar di sistem FTIP Unpad Alumni Club. Silakan daftar terlebih dahulu melalui halaman pendaftaran."
    );
  }

  // Generate JWT token
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

export const googleRegisterService = async (googleUserInfo: GoogleUserInfo, department: string, classYear: number) => {
  const { id: googleId, email, name } = googleUserInfo;

  if (!googleUserInfo.email_verified) {
    throw new Error("Email belum diverifikasi oleh Google");
  }

  // Check if user already exists with Google ID
  const existingGoogleUser = await prisma.user.findUnique({
    where: { googleId },
  });

  if (existingGoogleUser) {
    throw new Error("Akun Google sudah terdaftar. Silakan login.");
  }

  // Check if user exists with same email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.authProvider === "EMAIL") {
      throw new Error(
        "Email sudah terdaftar dengan metode login biasa. Silakan login dengan password."
      );
    }
    if (existingUser.authProvider === "GOOGLE") {
      throw new Error("Akun Google sudah terdaftar. Silakan login.");
    }
  }

  // Create new user and alumni profile with Google info
  const result = await prisma.$transaction(async (tx) => {
    // Create User first
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        googleId,
        authProvider: "GOOGLE",
        role: "USER",
      },
    });

    // Create AlumniProfile with provided department and class year
    const alumniProfile = await tx.alumniProfile.create({
      data: {
        userId: newUser.id,
        fullName: name,
        department: department as "TEP" | "TPN" | "TIN",
        classYear: classYear,
      },
    });

    return { user: newUser, profile: alumniProfile };
  });

  // Generate JWT token
  const token = jwt.sign(
    {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    user: { ...result.user, profile: result.profile },
    token
  };
};

export const getGoogleAuthUrl = () => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    prompt: "consent",
  });

  return authUrl;
};
