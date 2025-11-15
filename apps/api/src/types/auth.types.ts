/**
 * Shared types used across the API
 */

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

// Import User type from entity
import type { User } from '../users/entities/user.entity';
