import {
  ApiError,
  AuthError,
  NetworkError,
  ValidationError,
} from './api-errors';

/**
 * Union type for all custom error types
 */
export type AppError = ApiError | AuthError | NetworkError | ValidationError;

/**
 * Error callback function type
 */
export type ErrorCallback = (error: AppError | unknown) => void;

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  /**
   * Show user-friendly message
   */
  showUserMessage?: boolean;

  /**
   * Log to console
   */
  logError?: boolean;

  /**
   * Custom error formatter
   */
  formatMessage?: (error: AppError | unknown) => string;
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 'UNKNOWN_ERROR', 500, error);
  }

  if (typeof error === 'string') {
    return new ApiError(error);
  }

  return new ApiError('An unknown error occurred');
}

/**
 * Get error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
