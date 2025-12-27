import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import { generalRateLimit } from "./middlewares/rate-limit.middleware.ts";
import { requestLogger } from "./middlewares/logging.middleware.ts";
import { validateEncryptionKey } from "./lib/encryption.ts";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.ts";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.routes.ts";
import jobRouter from "./routers/job.routes.ts";
import businessRouter from "./routers/business.routes.ts";

const PORT: number = 8000;
const app: Application = express();

if (!validateEncryptionKey()) {
  console.error("validateEncryptionKey failed");
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
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

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).send(`Connected to ${process.env.APP_NAME} API`);
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}/api`)
);

export default app;
