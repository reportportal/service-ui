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

import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { MANAGER } from 'common/constants/projectRoles';

interface LockedDashboardAccessParams {
  userRole?: string;
  organizationRole?: string;
  userId?: string;
  owner?: string;
  canWorkWithDashboard?: boolean;
}

/**
 * A locked dashboard (and the widgets on it) can be modified, deleted, locked or unlocked only by
 * its owner, an organization MANAGER or an instance ADMINISTRATOR. The owner exception still
 * requires the base dashboard-modification permission (editor level in the project).
 */
export const canOverrideDashboardLock = ({
  userRole,
  organizationRole,
  userId,
  owner,
  canWorkWithDashboard = false,
}: LockedDashboardAccessParams): boolean =>
  userRole === ADMINISTRATOR ||
  organizationRole === MANAGER ||
  (canWorkWithDashboard && !!userId && !!owner && userId === owner);
