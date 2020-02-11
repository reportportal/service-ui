/*
 * Copyright 2019 EPAM Systems
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

import {
  userInfoSelector,
  userAccountRoleSelector,
  activeProjectRoleSelector,
} from 'controllers/user';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { canDeleteTestItem } from 'common/utils/permissions';
import { launchSelector } from './selectors';

export const validateDeleteItem = (item, items, state) => {
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  const currentLaunch = launchSelector(state) || {};
  if (!canDeleteTestItem(userRole, projectRole, currentLaunch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  if (currentLaunch.status && currentLaunch.status.toLowerCase() === IN_PROGRESS) {
    return 'launchNotInProgress';
  }
  return null;
};
