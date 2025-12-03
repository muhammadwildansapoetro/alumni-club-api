import type { Request, Response } from 'express';
import { verifyGoogleToken, googleAuthService, getGoogleAuthUrl } from '../services/google-auth.service.js';
import { googleAuthSchema } from '../types/auth.types.js';

export const getGoogleAuthController = (req: Request, res: Response) => {
  try {
    const authUrl = getGoogleAuthUrl();

    return res.json({
      message: 'Google OAuth URL generated',
      authUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const googleAuthController = async (req: Request, res: Response) => {
  try {
    const body = googleAuthSchema.parse(req.body);

    // Verify Google token
    const googleUserInfo = await verifyGoogleToken(body.token);

    // Authenticate or create user
    const { user, token } = await googleAuthService(googleUserInfo);

    return res.json({
      message: 'Login dengan Google berhasil',
      user,
      token,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const googleCallbackController = async (_req: Request, res: Response) => {
  try {
    // This would be implemented if you're using the full OAuth flow with redirect
    // For now, we're using the simpler ID token approach

    return res.status(501).json({
      error: 'Callback endpoint not implemented. Use token-based Google auth instead.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};