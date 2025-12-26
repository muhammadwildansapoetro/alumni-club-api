import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { adminRateLimit } from "../middlewares/rate-limit.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateOwnProfileController,
  softDeleteUserController,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  userListQuerySchema,
  updateProfileSchema,
} from "../types/user.types.js";

const router = Router();

router.use(authMiddleware);

// GET /api/users - List all users with search/filter (MUST come first, before /:id)
router.get(
  "/",
  validateRequest(userListQuerySchema, "query"),
  getAllUsersController
);

// GET /api/users/:id - View user by ID (all fields, frontend handles visibility)
router.get("/:id", getUserByIdController);

// PATCH /api/users/profile - Update own profile
router.patch(
  "/profile",
  validateRequest(updateProfileSchema),
  updateOwnProfileController
);

// Apply admin middleware to all following routes
router.use(adminMiddleware);

// POST /api/users - Create new user
router.post(
  "/",
  adminRateLimit,
  validateRequest(createUserSchema),
  createUserController
);

// DELETE /api/users/:id - Soft delete user
router.delete("/:id", adminRateLimit, softDeleteUserController);

export default router;
