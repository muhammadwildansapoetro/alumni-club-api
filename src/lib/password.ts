import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Password hashing configuration
const SALT_ROUNDS = 12;
const TOKEN_LENGTH = 32;

/**
 * Hash a password using bcrypt with salt
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a cryptographically secure random token
 * @param length Token length in bytes (default: 32)
 * @returns Hexadecimal token string
 */
export const generateSecureToken = (length: number = TOKEN_LENGTH): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate email verification token
 * @returns Secure token for email verification
 */
export const generateVerificationToken = (): string => {
  return generateSecureToken(TOKEN_LENGTH);
};

/**
 * Generate password reset token
 * @returns Secure token for password reset
 */
export const generatePasswordResetToken = (): string => {
  return generateSecureToken(TOKEN_LENGTH);
};

/**
 * Generate token expiration date
 * @param hours Hours from now for expiration
 * @returns Date object for token expiration
 */
export const generateTokenExpiration = (hours: number): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
};

/**
 * Validate password strength based on requirements
 * @param password Password to validate
 * @returns Object with validation result and error message
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: "Password minimal 8 karakter",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      isValid: false,
      error: "Password harus mengandung huruf besar, huruf kecil, dan angka",
    };
  }

  return { isValid: true };
};