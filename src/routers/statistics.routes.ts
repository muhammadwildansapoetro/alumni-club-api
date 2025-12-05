import { Router } from "express";
import {
  getAlumniStatsPublicController,
  getAlumniStatsDashboardController,
  searchAlumniPublicController,
  getJobStatsPublicController,
  getJobStatsDashboardController,
  getBusinessStatsPublicController,
  getBusinessStatsDashboardController,
  getAllStatsPublicController,
  getAllStatsDashboardController,
} from "../controllers/statistics.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const statisticsRouter = Router();

// ===== ALUMNI STATISTICS ENDPOINTS =====

// Public alumni statistics endpoints (no authentication required)
statisticsRouter.get("/alumni/public", getAlumniStatsPublicController);

// Protected alumni statistics endpoints (authentication required)
statisticsRouter.get("/alumni/dashboard", authMiddleware, getAlumniStatsDashboardController);

// Public alumni search endpoint (no authentication required)
statisticsRouter.get("/alumni/search", searchAlumniPublicController);

// ===== JOB POSTING STATISTICS ENDPOINTS =====

// Public job posting statistics endpoints (no authentication required)
statisticsRouter.get("/jobs/public", getJobStatsPublicController);

// Protected job posting statistics endpoints (authentication required)
statisticsRouter.get("/jobs/dashboard", authMiddleware, getJobStatsDashboardController);

// ===== BUSINESS POSTING STATISTICS ENDPOINTS =====

// Public business posting statistics endpoints (no authentication required)
statisticsRouter.get("/businesses/public", getBusinessStatsPublicController);

// Protected business posting statistics endpoints (authentication required)
statisticsRouter.get("/businesses/dashboard", authMiddleware, getBusinessStatsDashboardController);

// ===== COMBINED STATISTICS ENDPOINTS =====

// Public combined statistics endpoint (no authentication required)
statisticsRouter.get("/all/public", getAllStatsPublicController);

// Protected combined statistics endpoint (authentication required)
statisticsRouter.get("/all/dashboard", authMiddleware, getAllStatsDashboardController);

export default statisticsRouter;