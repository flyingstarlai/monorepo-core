/**
 * Common error types used across the application
 */

export interface QueryRetryError {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
  code?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
  field?: string;
  value?: unknown;
}

export interface NetworkError extends Error {
  name: 'NetworkError' | 'TypeError' | 'AbortError';
  message: string;
}

export interface ValidationError {
  field?: string;
  value?: unknown;
  message: string;
  code?: string;
}

export type RetryDecision = boolean;

export type RetryFunction = (
  failureCount: number,
  error: QueryRetryError,
) => RetryDecision;
