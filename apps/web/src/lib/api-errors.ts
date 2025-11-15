/**
 * Custom API Error Classes
 * Provides structured error handling for API responses
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode || 500;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create ApiError from fetch response
   */
  static fromResponse(response: Response, responseText?: string): ApiError {
    let message = `HTTP ${response.status}`;
    let code = 'HTTP_ERROR';

    try {
      // Try to parse error message from response
      if (responseText) {
        const errorData = JSON.parse(responseText);
        message = errorData.message || errorData.error || message;
        code = errorData.code || code;
      }
    } catch {
      // If parsing fails, use status text
      message = response.statusText || message;
    }

    return new ApiError(message, code, response.status);
  }

  /**
   * Check if error is a network error
   */
  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }

  /**
   * Check if error is an authentication error
   */
  get isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if error is a server error
   */
  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is a client error
   */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isAuthError) {
      return 'Your session has expired. Please log in again.';
    }
    if (this.isNetworkError) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (this.isServerError) {
      return 'Server error occurred. Please try again later.';
    }
    if (this.isClientError) {
      return this.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isNetworkError: this.isNetworkError,
      isAuthError: this.isAuthError,
      isServerError: this.isServerError,
      isClientError: this.isClientError,
      stack: this.stack,
    };
  }
}

/**
 * Authentication-specific error
 */
export class AuthError extends ApiError {
  constructor(
    message: string,
    code: string = 'AUTH_ERROR',
    originalError?: Error,
  ) {
    super(message, code, 401, originalError);
    this.name = 'AuthError';
  }

  /**
   * Create AuthError from various error types
   */
  static fromError(error: unknown): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    if (error instanceof ApiError) {
      return new AuthError(error.message, error.code, error.originalError);
    }

    if (error instanceof Error) {
      return new AuthError(error.message, 'UNKNOWN_AUTH_ERROR', error);
    }

    if (typeof error === 'string') {
      return new AuthError(error);
    }

    return new AuthError('Authentication failed');
  }

  /**
   * Check if error is due to invalid credentials
   */
  get isInvalidCredentials(): boolean {
    return (
      this.code === 'INVALID_CREDENTIALS' ||
      this.message.toLowerCase().includes('invalid') ||
      this.message.toLowerCase().includes('incorrect')
    );
  }

  /**
   * Check if error is due to expired token
   */
  get isTokenExpired(): boolean {
    return (
      this.code === 'TOKEN_EXPIRED' ||
      this.message.toLowerCase().includes('expired')
    );
  }

  /**
   * Check if error is due to account locked/disabled
   */
  get isAccountDisabled(): boolean {
    return (
      this.code === 'ACCOUNT_DISABLED' ||
      this.message.toLowerCase().includes('disabled') ||
      this.message.toLowerCase().includes('locked')
    );
  }
}

/**
 * Network-specific error
 */
export class NetworkError extends ApiError {
  constructor(
    message: string,
    code: string = 'NETWORK_ERROR',
    originalError?: Error,
  ) {
    super(message, code, 0, originalError);
    this.name = 'NetworkError';
  }

  /**
   * Create NetworkError from fetch error
   */
  static fromFetchError(error: Error): NetworkError {
    if (error.name === 'AbortError') {
      return new NetworkError('Request timeout', 'TIMEOUT', error);
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError('Network error occurred', 'NETWORK_ERROR', error);
    }

    return new NetworkError(error.message, 'NETWORK_ERROR', error);
  }
}

/**
 * Validation error
 */
export class ValidationError extends ApiError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any,
    code: string = 'VALIDATION_ERROR',
  ) {
    super(message, code, 400);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }

  /**
   * Create ValidationError from API response
   */
  static fromResponse(response: any): ValidationError {
    if (response.field && response.message) {
      return new ValidationError(
        response.message,
        response.field,
        response.value,
        response.code,
      );
    }

    return new ValidationError(response.message || 'Validation failed');
  }
}

/**
 * Error type guard utilities
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};
