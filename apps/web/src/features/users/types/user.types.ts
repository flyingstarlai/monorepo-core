import type { User, UserRole } from '@repo/api';

export type { User, UserRole };

export interface CreateUserData {
  username: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface UpdateUserData {
  fullName?: string;
  password?: string;
  role?: UserRole;
}

export interface UsersFilters {
  search?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
