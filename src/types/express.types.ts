import type { Request } from "express";

// Define UserRole enum locally to avoid Prisma import issues
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// API Response types for consistency
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}