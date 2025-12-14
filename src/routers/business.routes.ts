import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createBusinessListingController,
  getAllBusinessListingsController,
  getBusinessListingByIdController,
  updateBusinessListingController,
  deleteBusinessListingController,
} from "../controllers/business.controller.js";
import { businessOwnerMiddleware } from "../middlewares/owner.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createBusinessListingSchema,
  updateBusinessListingSchema,
  businessQuerySchema,
} from "../types/business.types.js";
import { decryptionMiddleware } from "../middlewares/decryption.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", validateRequest(businessQuerySchema, "query"), getAllBusinessListingsController);
router.get("/:id", getBusinessListingByIdController);

// POST /api/businesses - Create new business listing (all authenticated users)
router.post("/", decryptionMiddleware, validateRequest(createBusinessListingSchema), createBusinessListingController);

// PATCH /api/businesses/:id - Update business listing (owner or admin)
router.patch("/:id", decryptionMiddleware, validateRequest(updateBusinessListingSchema), businessOwnerMiddleware, updateBusinessListingController);

// DELETE /api/businesses/:id - Delete business listing (owner or admin)
router.delete("/:id", businessOwnerMiddleware, deleteBusinessListingController);

export default router;