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
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { ModalButtonProps } from 'types/common';
import styles from './deleteConfirmationModal.scss';

const cx = createClassnames(styles);

interface DeleteConfirmationModalProps {
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
}

export const DeleteConfirmationModal = ({
  title,
  description,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const handleConfirm = () => {
    onConfirm();
    dispatch(hideModalAction());
  };

  const okButton: ModalButtonProps = {
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
      title={title}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>{description}</div>
    </Modal>
  );
};
