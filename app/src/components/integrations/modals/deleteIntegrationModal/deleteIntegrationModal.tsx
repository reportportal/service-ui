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

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { createClassnames } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { ModalButtonProps } from 'types/common';

import styles from './deleteIntegrationModal.scss';

const cx = createClassnames(styles);

interface DeleteIntegrationModalData {
  onConfirm: () => void;
  modalTitle: ReactNode | string;
  description: ReactNode | string;
  isReset?: boolean;
}

const DeleteIntegrationModal = ({ data }: UseModalData<DeleteIntegrationModalData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const onDelete = () => {
    data.onConfirm();
    dispatch(hideModalAction());
  };

  const okButton = {
    children: data.isReset
      ? formatMessage(COMMON_LOCALE_KEYS.RESET)
      : formatMessage(COMMON_LOCALE_KEYS.DELETE),
    onClick: onDelete,
    variant: 'danger',
    'data-automation-id': 'submitButton',
  } satisfies ModalButtonProps;

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={data.modalTitle}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>{data.description}</div>
    </Modal>
  );
};

export default withModal('deleteIntegrationModal')(DeleteIntegrationModal);
