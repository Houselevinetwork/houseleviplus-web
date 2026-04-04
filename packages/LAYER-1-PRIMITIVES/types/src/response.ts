/**
 * @houselevi/types/response
 * Standard API response wrappers
 */

import type { AppError } from './error';

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: AppError;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface BulkResponse {
  succeeded: number;
  failed: number;
  errors: Array<{
    index: number;
    error: AppError;
  }>;
}
