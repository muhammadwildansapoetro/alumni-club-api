import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller.js";
import googleAuthRouter from "./google-auth.router.js";

const authRouter = Router();

// Regular email/password authentication
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

// Google authentication endpoints
authRouter.use("/google", googleAuthRouter);

export default authRouter;
