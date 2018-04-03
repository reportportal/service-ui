import { PROJECT_ROLES } from 'common/constants/projectRoles';

export function getRolesMap() {
  const roles = [];
  PROJECT_ROLES.forEach((role) => {
    roles.push({
      value: role,
      label: role.split('_').join(' '),
    });
  });
  return roles;
}
