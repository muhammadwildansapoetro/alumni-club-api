import { Router } from "express";
import {
  googleAuthController,
  googleRegisterController,
  googleCallbackController,
  getGoogleAuthController
} from "../controllers/google-auth.controller.js";

const authRouter = Router();

// Google authentication endpoints
authRouter.get("/google", getGoogleAuthController);
authRouter.post("/google", googleAuthController);
authRouter.post("/google/register", googleRegisterController);
authRouter.get("/google/callback", googleCallbackController);

export default authRouter;
