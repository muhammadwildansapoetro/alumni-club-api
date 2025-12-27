import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/express.types.js";
import {
  createBusinessListingService,
  getAllBusinessListingsService,
  getBusinessListingByIdService,
  updateBusinessListingService,
  deleteBusinessListingService,
} from "../services/business.service.js";

// POST /api/businesses - Create new business listing (authenticated users)
export const createBusinessListingController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const businessData = req.body;

    const businessListing = await createBusinessListingService(
      user.id,
      businessData
    );

    res.status(201).json({
      success: true,
      message: "Direktori bisnis berhasil dibuat",
      data: businessListing,
    });
  } catch (error) {
    console.error("Error di createBusinessListingController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// GET /api/businesses - Get all business listings (public)
export const getAllBusinessListingsController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const location = req.query.location as string;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;

    const result = await getAllBusinessListingsService(
      page,
      limit,
      search,
      category,
      location,
      isActive
    );

    res.json({
      success: true,
      message: "Berhasil mengambil daftar direktori bisnis",
      data: result,
    });
  } catch (error) {
    console.error("Error di getAllBusinessListingsController:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
    });
  }
};

// GET /api/businesses/:id - Get business listing by ID (public)
export const getBusinessListingByIdController = async (
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

    const business = await getBusinessListingByIdService(id);

    res.json({
      success: true,
      message: "Berhasil mengambil data direktori bisnis",
      data: business,
    });
  } catch (error) {
    console.error("Error di getBusinessListingByIdController:", error);
    if (
      error instanceof Error &&
      error.message === "Direktori bisnis tidak ditemukan"
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

// PATCH /api/businesses/:id - Update business listing (owner or admin)
export const updateBusinessListingController = async (
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

    const updatedBusiness = await updateBusinessListingService(id, updateData);

    res.json({
      success: true,
      message: "Direktori bisnis berhasil diperbarui",
      data: updatedBusiness,
    });
  } catch (error) {
    console.error("Error di updateBusinessListingController:", error);
    if (
      error instanceof Error &&
      error.message === "Direktori bisnis tidak ditemukan"
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

// DELETE /api/businesses/:id - Delete business listing (owner or admin)
export const deleteBusinessListingController = async (
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

    const result = await deleteBusinessListingService(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error di deleteBusinessListingController:", error);
    if (
      error instanceof Error &&
      error.message === "Direktori bisnis tidak ditemukan"
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
