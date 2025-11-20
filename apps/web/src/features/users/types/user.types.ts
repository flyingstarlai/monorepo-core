export interface User {
  id: string;
  username: string;
  fullName: string;
  deptNo: string;
  deptName: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  lastLoginAt?: Date;
  lastMobileLoginAt?: Date;
  lastMobileDeviceId?: string;
  lastMobileAppName?: string;
  lastMobileAppVersion?: string;
  lastMobileAppModule?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  password: string;
  fullName: string;
  deptNo: string;
  deptName: string;
  role?: User['role'];
  isActive?: boolean;
}

export interface UpdateUserData {
  fullName?: string;
  deptNo?: string;
  deptName?: string;
  role?: User['role'];
  isActive?: boolean;
}

export interface UsersFilters {
  search?: string;
  role?: User['role'];
  isActive?: boolean;
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

export interface FactoryUser {
  username: string;
  fullName: string;
  deptNo: string;
  deptName: string;
}

export interface FactoryDepartment {
  deptNo: string;
  deptName: string;
}
