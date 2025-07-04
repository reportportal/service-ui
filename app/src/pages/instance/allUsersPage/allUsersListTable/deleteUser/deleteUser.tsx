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

import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { deleteUserAccountAction } from 'controllers/user';
import { showSuccessNotification } from 'controllers/notification';
import { fetchAllUsersAction } from 'controllers/instance/allUsers';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { DeleteUserModal } from './deleteUserModal';
import styles from './deleteUser.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const messages = defineMessages({
  successfully: {
    id: 'DeleteUser.successfully',
    defaultMessage: 'The user has been deleted successfully',
  },
});

interface DeleteUserProps {
  fullName: string;
  userId: string;
}

export const DeleteUser = ({ fullName, userId }: DeleteUserProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const onSuccess = () => {
    dispatch(
      showSuccessNotification({
        message: formatMessage(messages.successfully, { name: fullName }),
      }),
    );

    dispatch(fetchAllUsersAction());
  };

  const onConfirm = () => {
    dispatch(deleteUserAccountAction(onSuccess, userId));
    trackEvent(ALL_USERS_PAGE_EVENTS.DELETE_USER);
  };

  const openDeleteUserModal = () => {
    dispatch(
      showModalAction({
        component: <DeleteUserModal onConfirm={onConfirm} fullName={fullName} />,
      }),
    );
  };

  const handleClick = () => {
    openDeleteUserModal();
    trackEvent(ALL_USERS_PAGE_EVENTS.OPEN_DELETE_USER_MODAL);
  };

  return (
    <button className={cx('delete-user')} type="button" onClick={handleClick}>
      {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
    </button>
  );
};
