import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/express.types.js";
import {
  createJobPostingService,
  getAllJobPostingsService,
  getJobPostingByIdService,
  updateJobPostingService,
  deleteJobPostingService,
} from "../services/job.service.js";

// POST /api/jobs - Create new job posting (authenticated users)
export const createJobPostingController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const jobData = req.body;

    const jobPosting = await createJobPostingService(user.id, jobData);

    res.status(201).json({
      success: true,
      message: "Lowongan kerja berhasil dibuat",
      data: jobPosting,
    });
  } catch (error) {
    console.error("Error di createJobPostingController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// GET /api/jobs - Get all job postings (public)
export const getAllJobPostingsController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const location = req.query.location as string;
    const jobType = req.query.jobType as string;
    const company = req.query.company as string;
    const isActive = req.query.isActive !== undefined ?
      req.query.isActive === "true" : undefined;

    const result = await getAllJobPostingsService(
      page,
      limit,
      search,
      location,
      jobType,
      company,
      isActive
    );

    res.json({
      success: true,
      message: "Berhasil mengambil daftar lowongan kerja",
      data: result,
    });
  } catch (error) {
    console.error("Error di getAllJobPostingsController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// GET /api/jobs/:id - Get job posting by ID (public)
export const getJobPostingByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const job = await getJobPostingByIdService(id);

    res.json({
      success: true,
      message: "Berhasil mengambil data lowongan kerja",
      data: job,
    });
  } catch (error) {
    console.error("Error di getJobPostingByIdController:", error);
    if (
      error instanceof Error &&
      error.message === "Lowongan kerja tidak ditemukan"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// PATCH /api/jobs/:id - Update job posting (owner or admin)
export const updateJobPostingController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const updateData = req.body;

    const updatedJob = await updateJobPostingService(id, updateData);

    res.json({
      success: true,
      message: "Lowongan kerja berhasil diperbarui",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error di updateJobPostingController:", error);
    if (
      error instanceof Error &&
      error.message === "Lowongan kerja tidak ditemukan"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// DELETE /api/jobs/:id - Delete job posting (owner or admin)
export const deleteJobPostingController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID tidak boleh kosong",
      });
    }

    const result = await deleteJobPostingService(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error di deleteJobPostingController:", error);
    if (
      error instanceof Error &&
      error.message === "Lowongan kerja tidak ditemukan"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};