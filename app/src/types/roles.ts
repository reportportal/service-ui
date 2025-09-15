type RolePermissions = Record<ProjectRoles, Record<string, boolean>>;

export type UserRoles = 'ADMINISTRATOR' | 'USER';
export type ProjectRoles = 'EDITOR' | 'VIEWER';
export type OrganizationRoles = 'MANAGER' | 'MEMBER';
export type PermissionsMap = Record<OrganizationRoles, RolePermissions | Record<string, boolean>>;
