import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createJobPostingController,
  getAllJobPostingsController,
  getJobPostingByIdController,
  updateJobPostingController,
  deleteJobPostingController,
} from "../controllers/job.controller.js";
import { jobOwnerMiddleware } from "../middlewares/owner.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createJobPostingSchema,
  updateJobPostingSchema,
  jobQuerySchema,
} from "../types/job.types.js";
import { decryptionMiddleware } from "../middlewares/decryption.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", validateRequest(jobQuerySchema, "query"), getAllJobPostingsController);
router.get("/:id", getJobPostingByIdController);

// POST /api/jobs - Create new job posting (all authenticated users)
router.post("/", decryptionMiddleware, validateRequest(createJobPostingSchema), createJobPostingController);

// PATCH /api/jobs/:id - Update job posting (owner or admin)
router.patch("/:id", decryptionMiddleware, validateRequest(updateJobPostingSchema), jobOwnerMiddleware, updateJobPostingController);

// DELETE /api/jobs/:id - Delete job posting (owner or admin)
router.delete("/:id", jobOwnerMiddleware, deleteJobPostingController);

export default router;