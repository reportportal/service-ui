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

import { FC } from 'react';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { showModalAction } from 'controllers/modal';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { updateUserInfoAction } from 'controllers/user';
import { showSuccessNotification } from 'controllers/notification';
import { fetchAllUsersAction } from 'controllers/instance/allUsers';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { UpdateUserInstanceRoleModal } from './updateUserInstanceRoleModal';
import { messages } from './messages';

interface UpdateUserInstanceRoleProps {
  email: string;
  fullName: string;
  instanceRole: string;
}

export const UpdateUserInstanceRole: FC<UpdateUserInstanceRoleProps> = ({
  email,
  fullName,
  instanceRole,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const isAdmin = instanceRole === ADMINISTRATOR;
  const newRole = isAdmin ? USER : ADMINISTRATOR;
  const title = formatMessage(isAdmin ? messages.revokeAdminRights : messages.provideAdminRights);
  const description = formatMessage(
    isAdmin ? messages.revokeAdminRightsDescription : messages.provideAdminRightsDescription,
    { name: fullName, b: (innerData) => Parser(`<b>${innerData}</b>`) },
  );

  const onSuccess = () => {
    dispatch(
      showSuccessNotification({
        message: formatMessage(messages.successMessage, { name: fullName }),
      }),
    );

    dispatch(fetchAllUsersAction());
  };

  const onConfirm = () => {
    const data = { role: newRole };
    dispatch(updateUserInfoAction(email, data, onSuccess));
    trackEvent(ALL_USERS_PAGE_EVENTS.clickProvideRevokeAdminRights(!isAdmin, true));
  };

  const openUpdateUserInstanceRoleModal = () => {
    dispatch(
      showModalAction({
        id: 'updateUserInstanceRoleModal',
        component: <UpdateUserInstanceRoleModal data={{ title, description, onConfirm }} />,
      }),
    );
  };

  const handleClick = () => {
    openUpdateUserInstanceRoleModal();
    trackEvent(ALL_USERS_PAGE_EVENTS.clickProvideRevokeAdminRights(!isAdmin));
  };

  return (
    <button type="button" onClick={handleClick} aria-label={title}>
      {title}
    </button>
  );
};
