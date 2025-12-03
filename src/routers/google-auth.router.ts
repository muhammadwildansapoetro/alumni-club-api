import { Router } from 'express';
import { getGoogleAuthController, googleAuthController, googleCallbackController } from '../controllers/google-auth.controller.js';

const router = Router();

// Get Google OAuth URL
router.get('/', getGoogleAuthController);

// Authenticate with Google token
router.post('/', googleAuthController);

// Google OAuth callback (for full OAuth flow)
router.get('/callback', googleCallbackController);

export default router;