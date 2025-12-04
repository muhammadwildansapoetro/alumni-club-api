import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller.js";
import { authRateLimit } from "../middlewares/rate-limit.middleware.js";
import googleAuthRouter from "./google-auth.router.js";

const authRouter = Router();

// Regular email/password authentication
authRouter.post("/register", authRateLimit, registerController);
authRouter.post("/login", authRateLimit, loginController);

// Google authentication endpoints
authRouter.use("/google", googleAuthRouter);

export default authRouter;
