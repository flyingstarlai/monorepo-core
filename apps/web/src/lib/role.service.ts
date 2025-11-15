export type UserRole = 'admin' | 'manager' | 'user';

export interface RolePermissions {
  canCreateUsers: boolean;
  canCreateRoles: UserRole[];
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canToggleUserStatus: boolean;
  canViewUserManagement: boolean;
  canEditRoles: boolean;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  user: 1,
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canCreateUsers: true,
    canCreateRoles: ['admin', 'manager', 'user'],
    canEditUsers: true,
    canDeleteUsers: true,
    canToggleUserStatus: true,
    canViewUserManagement: true,
    canEditRoles: true,
  },
  manager: {
    canCreateUsers: true,
    canCreateRoles: ['user'],
    canEditUsers: true,
    canDeleteUsers: false,
    canToggleUserStatus: true,
    canViewUserManagement: true,
    canEditRoles: false,
  },
  user: {
    canCreateUsers: false,
    canCreateRoles: [],
    canEditUsers: false,
    canDeleteUsers: false,
    canToggleUserStatus: false,
    canViewUserManagement: false,
    canEditRoles: false,
  },
};

export const RoleService = {
  /**
   * Check if a user has a specific role
   */
  hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
    return userRole === requiredRole;
  },

  /**
   * Check if a user has any of the specified roles
   */
  hasAnyRole(userRole: UserRole | undefined, roles: UserRole[]): boolean {
    if (!userRole) return false;
    return roles.includes(userRole);
  },

  /**
   * Check if a user has minimum role level or higher
   */
  hasMinimumRole(
    userRole: UserRole | undefined,
    minimumRole: UserRole,
  ): boolean {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
  },

  /**
   * Get permissions for a specific role
   */
  getPermissions(role: UserRole | undefined): RolePermissions {
    if (!role) return ROLE_PERMISSIONS.user;
    return ROLE_PERMISSIONS[role];
  },

  /**
   * Check if a user can create a user with a specific role
   */
  canCreateUserWithRole(
    creatorRole: UserRole | undefined,
    targetRole: UserRole,
  ): boolean {
    if (!creatorRole) return false;
    const permissions = ROLE_PERMISSIONS[creatorRole];
    return (
      permissions.canCreateUsers &&
      permissions.canCreateRoles.includes(targetRole)
    );
  },

  /**
   * Check if a user can edit another user's role
   */
  canEditUserRole(editorRole: UserRole | undefined): boolean {
    if (!editorRole) return false;

    // Only admins can edit roles
    return editorRole === 'admin';
  },

  /**
   * Get role display name with proper formatting
   */
  getRoleDisplayName(role: UserRole): string {
    const displayNames: Record<UserRole, string> = {
      admin: '系統管理員',
      manager: '維護員',
      user: '一般用戶',
    };
    return displayNames[role] || role;
  },

  /**
   * Get role description
   */
  getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      admin: '完整系統權限 - 可管理所有用戶和設定',
      manager: '可管理用戶但權限受限',
      user: '基本用戶權限 - 只能管理個人資料',
    };
    return descriptions[role] || '未知角色';
  },

  /**
   * Get available roles that a user can create
   */
  getAvailableRolesForCreation(creatorRole: UserRole | undefined): UserRole[] {
    if (!creatorRole) return [];
    return ROLE_PERMISSIONS[creatorRole].canCreateRoles;
  },

  /**
   * Check if user can access user management
   */
  canAccessUserManagement(userRole: UserRole | undefined): boolean {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].canViewUserManagement;
  },

  /**
   * Get role color for UI components
   */
  getRoleColor(role: UserRole): string {
    switch (role) {
      case 'admin':
        return '#9333ea'; // purple
      case 'manager':
        return '#2563eb'; // blue
      case 'user':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  },
};
