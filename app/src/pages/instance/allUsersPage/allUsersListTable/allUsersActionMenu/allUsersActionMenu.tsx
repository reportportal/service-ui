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

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { showModalAction } from 'controllers/modal';
import { userInfoSelector, UserInfo } from 'controllers/user';
import { fetchAllUsersAction } from 'controllers/instance/allUsers';
import { ActionMenu } from 'components/actionMenu';
import { canUpdateUserInstanceRole } from 'common/utils/permissions';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { UpdateUserInstanceRoleModal } from '../modals/updateUserInstanceRoleModal';
import { DeleteUserModal } from '../modals/deleteUserModal';
import { messages as updateRoleMessages } from '../modals/updateUserInstanceRoleModal/messages';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';

import { userRolesSelector } from 'controllers/pages';

interface User {
  id: number;
  email: string;
  fullName: string;
  instanceRole: string;
}

interface AllUsersActionMenuProps {
  user: User;
}

export const AllUsersActionMenu = ({ user }: AllUsersActionMenuProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const userRoles = useSelector(userRolesSelector);
  const currentUser = useSelector(userInfoSelector) as UserInfo;
  const isCurrentUser = currentUser?.id === user.id;

  const onSuccess = useCallback(() => {
    dispatch(fetchAllUsersAction());
  }, [dispatch]);

  const handleUpdateUserRole = useCallback(() => {
    const isAdmin = user.instanceRole === ADMINISTRATOR;

    dispatch(
      showModalAction({
        component: <UpdateUserInstanceRoleModal user={user} onSuccess={onSuccess} />,
      }),
    );
    trackEvent(ALL_USERS_PAGE_EVENTS.clickProvideRevokeAdminRights(!isAdmin));
  }, [dispatch, user, onSuccess, trackEvent]);

  const handleDeleteUser = useCallback(() => {
    dispatch(
      showModalAction({
        component: <DeleteUserModal user={user} onSuccess={onSuccess} />,
      }),
    );
    trackEvent(ALL_USERS_PAGE_EVENTS.OPEN_DELETE_USER_MODAL);
  }, [dispatch, user, onSuccess, trackEvent]);

  const actions = useMemo(
    () => [
      {
        label:
          user.instanceRole === ADMINISTRATOR
            ? formatMessage(updateRoleMessages.revokeAdminRights)
            : formatMessage(updateRoleMessages.provideAdminRights),
        onClick: handleUpdateUserRole,
        hasPermission: canUpdateUserInstanceRole(userRoles) && !isCurrentUser,
      },
      {
        label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        onClick: handleDeleteUser,
        hasPermission: !isCurrentUser,
        danger: true,
      },
    ],
    [user, handleUpdateUserRole, handleDeleteUser, isCurrentUser, userRoles, formatMessage],
  );

  return <ActionMenu actions={actions} />;
};
