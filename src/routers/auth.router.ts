import { Router } from "express";
import {
  googleAuthController,
  googleRegisterController,
  googleCallbackController,
  getGoogleAuthController
} from "../controllers/google-auth.controller.js";
import { authDecryptionMiddleware } from "../middlewares/decryption.middleware.js";

const authRouter = Router();

// Google authentication endpoints
authRouter.get("/google", getGoogleAuthController);
authRouter.post("/google", authDecryptionMiddleware, googleAuthController);
authRouter.post("/google/register", authDecryptionMiddleware, googleRegisterController);
authRouter.get("/google/callback", googleCallbackController);

export default authRouter;
