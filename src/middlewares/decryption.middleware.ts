import type { Request, Response, NextFunction } from 'express';
import { decryptFields, SENSITIVE_FIELDS, validateEncryptionKey } from '../lib/encryption.js';

// Middleware to decrypt sensitive fields in request body
export const decryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Validate encryption key is properly configured
  if (!validateEncryptionKey()) {
    console.error('Encryption key validation failed');
    return res.status(500).json({
      success: false,
      error: 'Server encryption configuration error'
    });
  }

  try {
    // Decrypt request body if it exists
    if (req.body && typeof req.body === 'object') {
      req.body = decryptFields(req.body, SENSITIVE_FIELDS);
    }

    // Decrypt query parameters if they exist (for encrypted URL params)
    if (req.query && typeof req.query === 'object') {
      req.query = decryptFields(req.query, SENSITIVE_FIELDS);
    }

    // Decrypt route parameters if they exist
    if (req.params && typeof req.params === 'object') {
      req.params = decryptFields(req.params, SENSITIVE_FIELDS);
    }

    next();
  } catch (error) {
    console.error('Decryption middleware error:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid encrypted data format'
    });
  }
};

// Middleware to decrypt specific authentication fields
export const authDecryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Validate encryption key
  if (!validateEncryptionKey()) {
    return res.status(500).json({
      success: false,
      error: 'Server encryption configuration error'
    });
  }

  try {
    // Authentication-specific sensitive fields
    const authFields = ['email', 'password', 'name', 'token', 'googleId'];

    if (req.body && typeof req.body === 'object') {
      req.body = decryptFields(req.body, authFields);
    }

    next();
  } catch (error) {
    console.error('Auth decryption middleware error:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid authentication data format'
    });
  }
};

// Middleware for profile data decryption
export const profileDecryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!validateEncryptionKey()) {
    return res.status(500).json({
      success: false,
      error: 'Server encryption configuration error'
    });
  }

  try {
    // Profile-specific sensitive fields
    const profileFields = [
      'fullName',
      'city',
      'jobTitle',
      'companyName',
      'linkedInUrl',
      'contactInfo',
      'website',
      'description'
    ];

    if (req.body && typeof req.body === 'object') {
      req.body = decryptFields(req.body, profileFields);
    }

    next();
  } catch (error) {
    console.error('Profile decryption middleware error:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid profile data format'
    });
  }
};

// Middleware to detect and log encryption attempts (for debugging)
export const encryptionLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hasEncryptedFields = Object.entries(req.body).some(([key, value]) => {
    if (typeof value === 'string' && value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) {
      return SENSITIVE_FIELDS.includes(key);
    }
    return false;
  });

  if (hasEncryptedFields) {
    console.log(`[${new Date().toISOString()}] Encrypted data detected in ${req.method} ${req.path}`, {
      encryptedFields: Object.keys(req.body).filter(key => SENSITIVE_FIELDS.includes(key))
    });
  }

  next();
};