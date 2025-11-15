export type UserRole = 'admin' | 'manager' | 'user';

export interface RolePermissions {
  canCreateUsers: boolean;
  canCreateRoles: UserRole[];
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canDeleteRoles: UserRole[]; // Specific roles that can be deleted
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
    canDeleteRoles: ['admin', 'manager', 'user'], // Can delete any role
    canToggleUserStatus: true,
    canViewUserManagement: true,
    canEditRoles: true,
  },
  manager: {
    canCreateUsers: true,
    canCreateRoles: ['user'],
    canEditUsers: true,
    canDeleteUsers: true, // Can delete users, but with restrictions
    canDeleteRoles: ['user'], // Can only delete regular users
    canToggleUserStatus: true,
    canViewUserManagement: true,
    canEditRoles: false,
  },
  user: {
    canCreateUsers: false,
    canCreateRoles: [],
    canEditUsers: false,
    canDeleteUsers: false,
    canDeleteRoles: [], // Cannot delete any users
    canToggleUserStatus: false,
    canViewUserManagement: false,
    canEditRoles: false,
  },
};

export class RoleService {
  /**
   * Check if a user has a specific role
   */
  static hasRole(
    userRole: UserRole | undefined,
    requiredRole: UserRole,
  ): boolean {
    return userRole === requiredRole;
  }

  /**
   * Check if a user has any of the specified roles
   */
  static hasAnyRole(
    userRole: UserRole | undefined,
    roles: UserRole[],
  ): boolean {
    if (!userRole) return false;
    return roles.includes(userRole);
  }

  /**
   * Check if a user has minimum role level or higher
   */
  static hasMinimumRole(
    userRole: UserRole | undefined,
    minimumRole: UserRole,
  ): boolean {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
  }

  /**
   * Get permissions for a specific role
   */
  static getPermissions(role: UserRole | undefined): RolePermissions {
    if (!role) return ROLE_PERMISSIONS.user;
    return ROLE_PERMISSIONS[role];
  }

  /**
   * Check if a user can create a user with a specific role
   */
  static canCreateUserWithRole(
    creatorRole: UserRole | undefined,
    targetRole: UserRole,
  ): boolean {
    if (!creatorRole) return false;
    const permissions = ROLE_PERMISSIONS[creatorRole];
    return (
      permissions.canCreateUsers &&
      permissions.canCreateRoles.includes(targetRole)
    );
  }

  /**
   * Check if a user can edit another user's role
   */
  static canEditUserRole(
    editorRole: UserRole | undefined,
    _targetRole: UserRole,
  ): boolean {
    if (!editorRole) return false;

    // Only admins can edit roles
    if (editorRole !== 'admin') return false;

    // Admins can edit any role except potentially themselves (business logic)
    return true;
  }

  /**
   * Check if a user can delete a user with a specific role
   */
  static canDeleteUserWithRole(
    deleterRole: UserRole | undefined,
    targetRole: UserRole,
  ): boolean {
    if (!deleterRole) return false;

    const permissions = ROLE_PERMISSIONS[deleterRole];
    return (
      permissions.canDeleteUsers &&
      permissions.canDeleteRoles.includes(targetRole)
    );
  }

  /**
   * Get role display name with proper formatting
   */
  static getRoleDisplayName(role: UserRole): string {
    const displayNames: Record<UserRole, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      user: 'User',
    };
    return displayNames[role] || role;
  }

  /**
   * Get role description
   */
  static getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      admin: 'Full system access - can manage all users and settings',
      manager: 'Can manage users but with limited permissions',
      user: 'Basic user access - can manage own profile',
    };
    return descriptions[role] || 'Unknown role';
  }

  /**
   * Validate role transition (for role changes)
   */
  static canChangeRole(editorRole: UserRole | undefined): boolean {
    if (!editorRole) return false;

    // Only admins can change roles
    if (editorRole !== 'admin') return false;

    // Admins can change any role to any other role
    return true;
  }

  /**
   * Get available roles that a user can create
   */
  static getAvailableRolesForCreation(
    creatorRole: UserRole | undefined,
  ): UserRole[] {
    if (!creatorRole) return [];
    return ROLE_PERMISSIONS[creatorRole].canCreateRoles;
  }

  /**
   * Check if user can access user management
   */
  static canAccessUserManagement(userRole: UserRole | undefined): boolean {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].canViewUserManagement;
  }
}
