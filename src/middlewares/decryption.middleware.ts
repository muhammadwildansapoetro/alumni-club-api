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

