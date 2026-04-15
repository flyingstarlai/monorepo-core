/**
 * Shared types used across the API
 */

import type { User } from '@repo/api';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}

export interface ChangePasswordResponse {
  message: string;
}

/**
 * Authenticated request with user attached
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
}
