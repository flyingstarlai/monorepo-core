import type { User } from '../types/user.types';
import { RoleService } from '@/lib/role.service';

export const getUserInitials = (user: User): string => {
  return user.fullName?.charAt(0) || user.username?.charAt(0) || '?';
};

export const getUserDisplayName = (user: User): string => {
  return user.fullName || user.username;
};

export const getRoleVariant = (
  _role: User['role'],
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  return 'outline'; // Use outline variant for all roles, will apply custom color
};

export const getRoleColor = (role: User['role']) => {
  return RoleService.getRoleColor(role);
};

export const getStatusVariant = (isActive: boolean) => {
  return isActive ? 'success' : 'destructive';
};

export const formatLastLogin = (lastLoginAt?: Date): string => {
  if (!lastLoginAt) return 'Never';
  return new Date(lastLoginAt).toLocaleString();
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString();
};
