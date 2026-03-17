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

import { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { ModalButtonProps } from 'types/common';
import styles from '../deleteUserModal/deleteUserModal.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  title: {
    id: 'DeleteUsersModal.title',
    defaultMessage: 'Delete users',
  },
  description: {
    id: 'DeleteUsersModal.description',
    defaultMessage:
      'Are you sure you want to delete <b>{count}</b> selected {count, plural, one {user} other {users}} from the Instance?',
  },
});

const Bold = (chunks: ReactNode) => <b>{chunks}</b>;

interface DeleteUsersModalProps {
  count: number;
  onConfirm: () => void;
}

export const DeleteUsersModal = ({ count, onConfirm }: DeleteUsersModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const okButton: ModalButtonProps = {
    text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    variant: 'danger',
    onClick: onConfirm,
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
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
        count,
        b: Bold,
      })}
    </Modal>
  );
};
