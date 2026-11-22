/*
 * Copyright 2026 EPAM Systems
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

import { useSelector } from 'react-redux';
import { userRolesSelector } from 'controllers/pages';
import { userIdSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { canOverrideDashboardLock } from 'common/utils/permissions/lockedDashboardAccess';

/**
 * Whether the current user may modify, delete, lock or unlock a LOCKED dashboard (or a widget on
 * it): the owner, an organization manager or an instance administrator.
 */
export const useCanOverrideDashboardLock = (owner) => {
  const { userRole, organizationRole } = useSelector(userRolesSelector);
  const userId = useSelector(userIdSelector);
  const { canWorkWithDashboard } = useUserPermissions();

  return canOverrideDashboardLock({
    userRole,
    organizationRole,
    userId,
    owner,
    canWorkWithDashboard,
  });
};
