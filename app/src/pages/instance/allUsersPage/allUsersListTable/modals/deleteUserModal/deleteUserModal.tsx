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
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalButtonProps } from 'types/common';
import styles from './deleteUserModal.scss';
import { deleteUserAccountAction } from 'controllers/user';
import { useTracking } from 'react-tracking';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { showSuccessNotification } from 'controllers/notification';

const cx = classNames.bind(styles) as typeof classNames;

export const messages = defineMessages({
  title: {
    id: 'DeleteUserModal.title',
    defaultMessage: 'Delete user',
  },
  description: {
    id: 'DeleteUserModal.description',
    defaultMessage: `Are you sure you want to delete <b>{name}</b> from the Instance?`,
  },
  successfully: {
    id: 'DeleteUser.successfully',
    defaultMessage: 'The user has been deleted successfully',
  },
});

interface DeleteUserModalProps {
  user: {
    id: number;
    fullName: string;
  };
  onSuccess?: () => void;
}

export const DeleteUserModal = ({ user, onSuccess }: DeleteUserModalProps) => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();

  const handleConfirm = () => {
    const handleDeleteSuccess = () => {
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.successfully, { name: user.fullName }),
        }),
      );
      dispatch(hideModalAction());
      onSuccess?.();
      trackEvent(ALL_USERS_PAGE_EVENTS.DELETE_USER);
    };
    dispatch(deleteUserAccountAction(handleDeleteSuccess, user.id));
  };

  const okButton: ModalButtonProps = {
    text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    variant: 'danger',
    onClick: handleConfirm,
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      className={cx('modal')}
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {formatMessage(messages.description, {
        name: user.fullName,
        b: (innerData) => <b>{innerData}</b>,
      })}
    </Modal>
  );
};
