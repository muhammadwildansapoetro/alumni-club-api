import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import { generalRateLimit } from "./middlewares/rate-limit.middleware.js";
import { requestLogger } from "./middlewares/logging.middleware.js";
import { validateEncryptionKey } from "./lib/encryption.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.routes.js";
import jobRouter from "./routers/job.routes.js";
import businessRouter from "./routers/business.routes.js";
import alumniRouter from "./routers/alumni.routes.js";
import statisticsRouter from "./routers/statistics.routes.js";

const PORT: number = 8000;
const app: Application = express();

// Validate encryption key on startup
if (!validateEncryptionKey()) {
  console.error('❌ Invalid ENCRYPTION_KEY environment variable');
  console.error('Please set a valid 32-byte base64-encoded encryption key');
  process.exit(1);
}

console.log('✅ Encryption key validated successfully');

app.use(express.json());
app.use(cookieParser());

// Apply request logging before other middleware
app.use(requestLogger);

// Apply general rate limiting to all API endpoints
app.use(generalRateLimit);

app.use(
  cors({
    origin: process.env.BASE_URL_FE,
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/jobs", jobRouter);
app.use("/businesses", businessRouter);
app.use("/alumni", alumniRouter);
app.use("/statistics", statisticsRouter);

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).send(`Connected to ${process.env.APP_NAME} API`);
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}/api`)
);

export default app;
