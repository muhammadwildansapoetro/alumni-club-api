import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
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
import { uploadCSVSingle, handleUploadError } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes (but need authentication)
router.use(authMiddleware); // Semua routes di bawah butuh auth

// Alumni directory - semua user bisa akses
router.get("/directory", getAlumniDirectoryController);

// Get user by ID - semua user bisa akses (view only)
router.get("/:id", getUserByIdController);

// Admin-only routes
router.use("/admin", adminMiddleware);

// User management (admin only)
router.get("/admin/list", getAllUsersController);
router.get("/admin/deleted", getDeletedUsersController);
router.post("/admin/create", createUserController);
router.post("/admin/import", uploadCSVSingle, handleUploadError, importAlumniFromCSVController);
router.post("/admin/validate-csv", uploadCSVSingle, handleUploadError, validateCSVTemplateController);

// Role management (admin only)
router.put("/:id/role", adminMiddleware, updateUserRoleController);

// User restoration (admin only)
router.put("/:id/restore", adminMiddleware, restoreUserController);

// Soft delete (admin only)
router.delete("/:id", adminMiddleware, softDeleteUserController);

// Profile update (user itself or admin)
router.put("/:id/profile", updateUserProfileController);

// Password update (user itself or admin)
router.put("/:id/password", updateUserPasswordController);

export default router;