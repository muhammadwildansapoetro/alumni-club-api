import type { Request, Response } from "express";
import {
  getAlumniStatsPublicService,
  getAlumniStatsDashboardService,
  searchAlumniPublicService,
  getJobStatsPublicService,
  getJobStatsDashboardService,
  getBusinessStatsPublicService,
  getBusinessStatsDashboardService,
  getAllStatsPublicService,
  getAllStatsDashboardService,
} from "../services/statistics.service.js";
import {
  alumniStatsPublicQuerySchema,
  alumniStatsDashboardQuerySchema,
  jobStatsPublicQuerySchema,
  jobStatsDashboardQuerySchema,
  businessStatsPublicQuerySchema,
  businessStatsDashboardQuerySchema,
  allStatsPublicQuerySchema,
  allStatsDashboardQuerySchema,
  alumniSearchPublicSchema,
} from "../types/statistics.types.js";
import { ValidationError } from "../utils/errors.js";

// ===== ALUMNI STATISTICS CONTROLLERS =====

// Public alumni statistics controller
export const getAlumniStatsPublicController = async (req: Request, res: Response) => {
  try {
    const query = alumniStatsPublicQuerySchema.parse(req.query);
    const stats = await getAlumniStatsPublicService(query.refresh);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik alumni untuk publik",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getAlumniStatsPublicController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// Dashboard alumni statistics controller (requires authentication)
export const getAlumniStatsDashboardController = async (req: Request, res: Response) => {
  try {
    const query = alumniStatsDashboardQuerySchema.parse(req.query);
    const stats = await getAlumniStatsDashboardService(query.refresh, query.includeIncome);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik alumni untuk dashboard",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getAlumniStatsDashboardController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// Public alumni search and filter controller
export const searchAlumniPublicController = async (req: Request, res: Response) => {
  try {
    const query = alumniSearchPublicSchema.parse(req.query);
    const result = await searchAlumniPublicService(query);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data alumni",
      data: result,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in searchAlumniPublicController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// ===== JOB POSTING STATISTICS CONTROLLERS =====

// Public job posting statistics controller
export const getJobStatsPublicController = async (req: Request, res: Response) => {
  try {
    const query = jobStatsPublicQuerySchema.parse(req.query);
    const stats = await getJobStatsPublicService(query.refresh);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik lowongan kerja untuk publik",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getJobStatsPublicController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// Dashboard job posting statistics controller (requires authentication)
export const getJobStatsDashboardController = async (req: Request, res: Response) => {
  try {
    const query = jobStatsDashboardQuerySchema.parse(req.query);
    const stats = await getJobStatsDashboardService(
      query.refresh,
      query.includeSalaryDetails,
      query.includeApplicationStats
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik lowongan kerja untuk dashboard",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getJobStatsDashboardController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// ===== BUSINESS POSTING STATISTICS CONTROLLERS =====

// Public business posting statistics controller
export const getBusinessStatsPublicController = async (req: Request, res: Response) => {
  try {
    const query = businessStatsPublicQuerySchema.parse(req.query);
    const stats = await getBusinessStatsPublicService(query.refresh);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik direktori bisnis untuk publik",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getBusinessStatsPublicController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// Dashboard business posting statistics controller (requires authentication)
export const getBusinessStatsDashboardController = async (req: Request, res: Response) => {
  try {
    const query = businessStatsDashboardQuerySchema.parse(req.query);
    const stats = await getBusinessStatsDashboardService(
      query.refresh,
      query.includeRevenueData,
      query.includeContactStats
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik direktori bisnis untuk dashboard",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getBusinessStatsDashboardController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// ===== COMBINED STATISTICS CONTROLLERS =====

// Public combined statistics controller
export const getAllStatsPublicController = async (req: Request, res: Response) => {
  try {
    const query = allStatsPublicQuerySchema.parse(req.query);
    const refreshOptions = {
      alumni: query.refreshAlumni || query.refresh,
      jobs: query.refreshJobs || query.refresh,
      business: query.refreshBusiness || query.refresh,
    };

    const stats = await getAllStatsPublicService(refreshOptions);

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik lengkap untuk publik",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getAllStatsPublicController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// Dashboard combined statistics controller (requires authentication)
export const getAllStatsDashboardController = async (req: Request, res: Response) => {
  try {
    const query = allStatsDashboardQuerySchema.parse(req.query);
    const refreshOptions = {
      alumni: query.refreshAlumni || query.refresh,
      jobs: query.refreshJobs || query.refresh,
      business: query.refreshBusiness || query.refresh,
    };

    const stats = await getAllStatsDashboardService(
      refreshOptions,
      query.includeIncome,
      query.includeSalaryDetails,
      query.includeRevenueData
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik lengkap untuk dashboard",
      data: stats,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Error in getAllStatsDashboardController:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};