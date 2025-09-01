import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userRolesSelector } from 'controllers/pages';
import * as permissions from 'common/utils/permissions';

type PermissionFunctions = typeof permissions;
type PermissionBooleans = {
  [K in keyof PermissionFunctions]: boolean;
};

export const useUserPermissions = (): PermissionBooleans => {
  const userRoles = useSelector(userRolesSelector);

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(permissions).map(([key, fn]) => [
          key,
          (fn as (roles: typeof userRoles) => boolean)(userRoles),
        ]),
      ) as PermissionBooleans,
    [userRoles],
  );
};
