import { Router } from "express";
import {
  // Email/Password authentication endpoints
  registerController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendVerificationSchema,
} from "../types/auth.types.js";

const authRouter = Router();

// Email/Password authentication endpoints
authRouter.post(
  "/register",
  validateRequest(registerSchema),
  registerController
);
authRouter.post("/login", validateRequest(loginSchema), loginController);
authRouter.get("/verify-email/:token", verifyEmailController);
authRouter.post(
  "/resend-verification",
  validateRequest(resendVerificationSchema),
  resendVerificationController
);
authRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPasswordController
);
authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPasswordController
);
authRouter.post(
  "/change-password",
  validateRequest(changePasswordSchema),
  changePasswordController
);

export default authRouter;
