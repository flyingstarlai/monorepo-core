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
  return formatDateTime(lastLoginAt);
};

const formatDateTime = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDate = (date?: Date): string => {
  if (!date) return '未指定';
  return formatDateTime(date);
};
