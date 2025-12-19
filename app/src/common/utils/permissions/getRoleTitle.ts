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

import { defineMessages, MessageDescriptor } from 'react-intl';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { EDITOR, MANAGER } from 'common/constants/projectRoles';
import { ADMIN_TYPE, MANAGER_TYPE, YOU_TYPE } from './constants';

interface Badge {
  title: MessageDescriptor;
  type: string;
}

const messages = defineMessages({
  adminRole: {
    id: 'MembersListTable.adminRole',
    defaultMessage: 'Admin',
  },
  managerRole: {
    id: 'MembersListTable.managerRole',
    defaultMessage: 'Manager',
  },
  youRole: {
    id: 'MembersListTable.youRole',
    defaultMessage: 'You',
  },
  editorRole: {
    id: 'MembersListTable.editorRole',
    defaultMessage: 'Can edit',
  },
  viewerRole: {
    id: 'MembersListTable.viewerRole',
    defaultMessage: 'View only',
  },
  memberRole: {
    id: 'MembersListTable.memberRole',
    defaultMessage: 'Member',
  },
});

export const getRoleTitle = (projectRole: string): MessageDescriptor => {
  if (projectRole === EDITOR) {
    return messages.editorRole;
  }

  return messages.viewerRole;
};

export const getOrgRoleTitle = (orgRole: string): MessageDescriptor => {
  if (orgRole === MANAGER) {
    return messages.managerRole;
  }

  return messages.memberRole;
};

export const getRoleBadgesData = (
  userRole: string,
  organizationRole: string,
  isCurrentLoggedInUser: boolean,
) => {
  const badges: Badge[] = [];
  if (userRole === ADMINISTRATOR) {
    badges.push({
      title: messages.adminRole,
      type: ADMIN_TYPE,
    });
  }
  if (organizationRole === MANAGER) {
    badges.push({
      title: messages.managerRole,
      type: MANAGER_TYPE,
    });
  }
  if (isCurrentLoggedInUser) {
    badges.push({
      title: messages.youRole,
      type: YOU_TYPE,
    });
  }

  return badges;
};
