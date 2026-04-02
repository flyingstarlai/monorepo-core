export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user';

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

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
