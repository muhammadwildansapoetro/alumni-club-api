import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import {
  uploadRateLimit,
  adminRateLimit,
} from "../middlewares/rate-limit.middleware.js";
import {
  getAllUsersController,
  getAlumniDirectoryController,
  getUserByIdController,
  updateUserRoleController,
  updateUserProfileController,
  updateUserPasswordController,
  softDeleteUserController,
  restoreUserController,
  getDeletedUsersController,
  createUserController,
  importAlumniFromCSVController,
  validateCSVTemplateController,
} from "../controllers/user.controller.js";
import {
  uploadCSVSingle,
  handleUploadError,
} from "../middlewares/upload.middleware.js";

const router = Router();

// All routes below require authentication
router.use(authMiddleware);

/* ============================
   User-facing routes
============================ */

// Public directory (authenticated users)
router.get("/directory", getAlumniDirectoryController);

// View user profile
router.get("/:id", getUserByIdController);

/* ============================
   Admin routes
============================ */

router.use("/admin", adminMiddleware);

// User management
router.get("/admin/list", adminRateLimit, getAllUsersController);
router.get("/admin/deleted", adminRateLimit, getDeletedUsersController);
router.post("/admin/create", adminRateLimit, createUserController);

// CSV operations
router.post(
  "/admin/import",
  uploadRateLimit,
  uploadCSVSingle,
  handleUploadError,
  importAlumniFromCSVController
);
router.post(
  "/admin/validate-csv",
  uploadRateLimit,
  uploadCSVSingle,
  handleUploadError,
  validateCSVTemplateController
);

// User role & status management
router.put("/admin/:id/role", adminRateLimit, updateUserRoleController);
router.put("/admin/:id/restore", adminRateLimit, restoreUserController);
router.delete("/admin/:id", adminRateLimit, softDeleteUserController);

// Admin profile/password update (acting on a specific user)
router.patch("/admin/:id/profile", adminRateLimit, updateUserProfileController);
router.patch("/admin/:id/password", adminRateLimit, updateUserPasswordController);

export default router;
