import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { encrypt } from "../lib/encryption.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
const JWT_EXPIRES = "7d";

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Helper function to identify token type
function identifyTokenType(token: string): string {
  // Check if it's a JWT (3 segments separated by dots)
  if (token.includes('.') && token.split('.').length === 3) {
    return 'JWT ID Token';
  }

  // Check if it looks like a session identifier (alphanumeric with timestamp)
  if (/^[a-zA-Z0-9]+-[0-9]+$/.test(token)) {
    return 'Session Identifier';
  }

  // Check if it's a Google OAuth access token (usually longer and alphanumeric)
  if (/^[a-zA-Z0-9_-]+$/.test(token) && token.length > 20) {
    return 'Access Token';
  }

  // Check if it's an authorization code (usually shorter)
  if (/^[a-zA-Z0-9/_-]+$/.test(token) && token.length < 50) {
    return 'Authorization Code';
  }

  return 'Unknown Token Type';
}

// Helper function to provide suggestions based on token type
function getErrorMessageForTokenType(tokenType: string): string {
  switch (tokenType) {
    case 'Session Identifier':
      return 'This appears to be a session identifier, not a Google ID token. Make sure your frontend is extracting the ID token from Google Sign-In response.';
    case 'Access Token':
      return 'This appears to be an OAuth access token, not an ID token. Please use the ID token from Google Sign-In.';
    case 'Authorization Code':
      return 'This appears to be an authorization code. You need to exchange it for an ID token first, or use Google Sign-In to get ID tokens directly.';
    default:
      return 'Please ensure your frontend is using Google Sign-In to obtain proper ID tokens in JWT format.';
  }
}

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
    // Debug logging to identify token format
    const tokenType = identifyTokenType(token);
    console.log('Token received:', {
      token: token.substring(0, 20) + '...',
      tokenLength: token.length,
      tokenType: typeof token,
      identifiedAs: tokenType,
      hasDots: token.includes('.'),
      segments: token.split('.').length
    });

    // Check if token looks like a JWT (should have 3 segments separated by dots)
    if (!token.includes('.') || token.split('.').length !== 3) {
      const suggestions = getErrorMessageForTokenType(tokenType);
      throw new Error(`Invalid token format. Expected Google JWT ID token with 3 segments, but received ${tokenType}. ${suggestions}`);
    }

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
    const rawToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Encrypt token for secure transmission
    const encryptedToken = encrypt(rawToken);

    return { user, token: encryptedToken };
  }

  // Check if user exists with same email but different auth provider
  user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (user) {
    // Update existing user with Google info (user was previously registered)
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId,
        name: name || user.name,
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
  const rawToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  // Encrypt token for secure transmission
  const encryptedToken = encrypt(rawToken);

  return { user, token: encryptedToken };
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
    throw new Error("Email sudah terdaftar. Silakan login.");
  }

  // Create new user and alumni profile with Google info
  const result = await prisma.$transaction(async (tx) => {
    // Create User first
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        googleId,
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
  const rawToken = jwt.sign(
    {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  // Encrypt token for secure transmission
  const encryptedToken = encrypt(rawToken);

  return {
    user: { ...result.user, profile: result.profile },
    token: encryptedToken
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
