/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userRolesSelector } from 'controllers/pages';
import * as permissions from 'common/utils/permissions/permissions';

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
