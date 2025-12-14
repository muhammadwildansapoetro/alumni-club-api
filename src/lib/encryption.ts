import crypto from 'crypto';

// Encryption configuration (must match frontend)
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Get encryption key from environment (base64 encoded)
function getEncryptionKey(): Buffer {
  const encryptionKeyBase64 = process.env.ENCRYPTION_KEY;
  if (!encryptionKeyBase64) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  return Buffer.from(encryptionKeyBase64, 'base64');
}

// Encrypt data (for response encryption if needed)
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key using PBKDF2 (matching frontend)
    const derivedKey = crypto.pbkdf2Sync(key, salt, PBKDF2_ITERATIONS, 32, 'sha256');

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, derivedKey);
    cipher.setAAD(Buffer.from('FTIP-Alumni-Club', 'utf8'));

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error}`);
  }
}

// Decrypt data (for request decryption)
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key using PBKDF2 (matching frontend)
    const derivedKey = crypto.pbkdf2Sync(key, salt, PBKDF2_ITERATIONS, 32, 'sha256');

    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, derivedKey);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('FTIP-Alumni-Club', 'utf8'));

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error}`);
  }
}

// Decrypt object field if encrypted
export function decryptField(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }

  // Check if this looks like encrypted data (base64 with sufficient length)
  if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) {
    try {
      return decrypt(value);
    } catch (error) {
      // If decryption fails, assume it's not encrypted
      return value;
    }
  }

  return value;
}

// Decrypt multiple fields in an object
export function decryptFields(obj: any, fieldsToDecrypt: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const decrypted = { ...obj };

  for (const field of fieldsToDecrypt) {
    if (decrypted[field]) {
      decrypted[field] = decryptField(decrypted[field]);
    }
  }

  return decrypted;
}

// Sensitive fields that should be decrypted
export const SENSITIVE_FIELDS = [
  'email',
  'name',
  'fullName',
  'city',
  'jobTitle',
  'companyName',
  'linkedInUrl',
  'contactInfo',
  'website',
  'token',
  'googleId',
  'password'
];

// Validate encryption key format
export function validateEncryptionKey(): boolean {
  try {
    const key = getEncryptionKey();
    return key.length === 32; // 256 bits
  } catch (error) {
    return false;
  }
}

// Generate secure encryption key (for development setup)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}