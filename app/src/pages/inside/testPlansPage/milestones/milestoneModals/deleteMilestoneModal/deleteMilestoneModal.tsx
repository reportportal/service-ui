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

import { ChangeEvent, type ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useModalButtons } from 'hooks/useModalButtons';

import { useDeleteMilestone } from './useDeleteMilestone';
import { messages } from './messages';
import type { DeleteMilestoneModalProps } from './types';
import { isDeleteMilestoneConfirmationValid } from './utils';

import styles from './deleteMilestoneModal.scss';

const cx = createClassnames(styles);

const renderDeleteConfirmationBold = (chunks: ReactNode) => <strong>{chunks}</strong>;

export const DeleteMilestoneModal = ({ data }: DeleteMilestoneModalProps) => {
  const { formatMessage } = useIntl();
  const [confirmText, setConfirmText] = useState('');
  const { isLoading, deleteMilestone } = useDeleteMilestone();

  const handleSubmit = () => {
    if (!data || !isDeleteMilestoneConfirmationValid(confirmText)) return;
    void deleteMilestone(data.id);
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: !isDeleteMilestoneConfirmationValid(confirmText),
    variant: 'danger',
    onSubmit: handleSubmit as VoidFn,
  });

  if (!data) {
    return null;
  }

  return (
    <Modal
      title={formatMessage(messages.deleteMilestone)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
      className={cx('delete-milestone-modal')}
    >
      <div className={cx('delete-milestone-modal__body')}>
        <p className={cx('delete-milestone-modal__message')}>
          {formatMessage(messages.deleteConfirmation, {
            milestoneName: data.name,
            b: renderDeleteConfirmationBold,
          })}
        </p>
        <div className={cx('delete-milestone-modal__confirm-field')}>
          <FieldText
            label={formatMessage(messages.typeDeleteInstructionLabel)}
            defaultWidth={false}
            value={confirmText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)}
            placeholder={formatMessage(messages.confirmPlaceholder)}
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
};
