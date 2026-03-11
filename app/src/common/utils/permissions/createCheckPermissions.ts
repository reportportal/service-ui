import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { MANAGER } from 'common/constants/projectRoles';
import { UserRoles, OrganizationRoles, ProjectRoles, PermissionsMap } from '../../../types/roles';

export const createCheckPermission =
  (permissionMap: PermissionsMap) =>
    (permission: string) =>
      ({
         userRole,
         organizationRole,
         projectRole,
       }: {
        userRole: UserRoles;
        organizationRole: OrganizationRoles;
        projectRole: ProjectRoles;
      }) => {
        if (userRole === ADMINISTRATOR) {
          return true;
        }

        if (organizationRole === MANAGER) {
          return !!permissionMap[organizationRole][permission];
        }

        if (permissionMap[organizationRole]?.[projectRole]) {
          return !!permissionMap[organizationRole][projectRole][permission];
        }

        return false;
      };
