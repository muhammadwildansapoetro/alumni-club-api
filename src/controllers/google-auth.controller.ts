import type { Request, Response } from 'express';
import { verifyGoogleToken, googleAuthService, googleRegisterService, getGoogleAuthUrl } from '../services/google-auth.service.js';
import { googleAuthSchema, googleRegisterSchema } from '../types/auth.types.js';

export const getGoogleAuthController = (_req: Request, res: Response) => {
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

export const googleRegisterController = async (req: Request, res: Response) => {
  try {
    const body = googleRegisterSchema.parse(req.body);

    // Verify Google token
    const googleUserInfo = await verifyGoogleToken(body.token);

    // Register user with Google info and additional registration data
    const { user, token } = await googleRegisterService(
      googleUserInfo,
      body.npm,
      body.department,
      body.classYear
    );

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran dengan Google berhasil! Selamat bergabung dengan FTIP Unpad Alumni Club.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        alumniProfile: {
          id: user.profile.id,
          fullName: user.profile.fullName,
          department: user.profile.department,
          classYear: user.profile.classYear,
          createdAt: user.profile.createdAt,
        },
        token,
        expiresIn: "7d",
      },
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