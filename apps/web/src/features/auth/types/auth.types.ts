import type { User } from '@/features/users/types/user.types';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface UpdateProfileResponse extends User {
  // User data with all fields after profile update
}
