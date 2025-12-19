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
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Modal } from '@reportportal/ui-kit';

import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalButtonProps } from 'types/common';
import { createClassnames } from 'common/utils';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { messages } from './messages';
import { updateUserInfoAction } from 'controllers/user';
import { showSuccessNotification } from 'controllers/notification';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';

import styles from './updateUserInstanceRoleModal.scss';

const cx = createClassnames(styles);

interface UpdateUserInstanceRoleModalProps {
  user: {
    id: number;
    email: string;
    fullName: string;
    instanceRole: string;
  };
  onSuccess?: () => void;
}

export const UpdateUserInstanceRoleModal = ({
  user,
  onSuccess,
}: UpdateUserInstanceRoleModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const isAdmin = user.instanceRole === ADMINISTRATOR;
  const newRole = isAdmin ? USER : ADMINISTRATOR;
  const title = formatMessage(isAdmin ? messages.revokeAdminRights : messages.provideAdminRights);
  const description = formatMessage(
    isAdmin ? messages.revokeAdminRightsDescription : messages.provideAdminRightsDescription,
    { name: user.fullName, b: (innerData) => <b>{innerData}</b> },
  );

  const handleConfirm = () => {
    const data = { role: newRole };
    const handleUpdateSuccess = () => {
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.successMessage, { name: user.fullName }),
        }),
      );
      dispatch(hideModalAction());
      onSuccess?.();
      trackEvent(ALL_USERS_PAGE_EVENTS.clickProvideRevokeAdminRights(!isAdmin, true));
    };

    dispatch(updateUserInfoAction(user.email, data, handleUpdateSuccess));
  };

  const okButton: ModalButtonProps = {
    text: title,
    children: title,
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
      title={title}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {description}
    </Modal>
  );
};
