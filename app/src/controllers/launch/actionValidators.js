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
import {
  canMergeLaunches,
  canForceFinishLaunch,
  canMoveToDebug,
  canDeleteLaunch,
} from 'common/utils/permissions';

export const validateMergeLaunch = (launch, launches, state) => {
  if (launches.length < 2) {
    return 'selectMoreItems';
  }
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canMergeLaunches(userRole, projectRole, launch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  if (launch.status && launch.status.toLowerCase() === IN_PROGRESS) {
    return 'launchNotInProgress';
  }
  if (launch.isProcessing) {
    return 'launchIsProcessing';
  }
  return null;
};

export const validateFinishForceLaunch = (launch, launches, state) => {
  if (launch.status && launch.status.toLowerCase() !== IN_PROGRESS) {
    return 'launchFinished';
  }
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canForceFinishLaunch(userRole, projectRole, launch.owner === user.userId || launch.rerun)) {
    return 'notYourOwnLaunch';
  }
  return null;
};

export const validateMoveLaunch = (launch, launches, state) => {
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canMoveToDebug(userRole, projectRole, launch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  return null;
};

export const validateDeleteLaunch = (launch, launches, state) => {
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canDeleteLaunch(userRole, projectRole, launch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  if (launch.status && launch.status.toLowerCase() === IN_PROGRESS) {
    return 'launchNotInProgress';
  }
  return null;
};
