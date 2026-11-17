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

import {
  ChangeEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { FieldText, Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useModalButtons } from 'hooks/useModalButtons';

import { useDeleteMilestone } from './useDeleteMilestone';
import { messages } from './messages';
import type { DeleteMilestoneModalProps } from './types';
import { isDeleteMilestoneConfirmationValid, needsLabelTextSelectionFix } from './utils';

import styles from './deleteMilestoneModal.scss';

const cx = createClassnames(styles);

const renderDeleteConfirmationBold = (chunks: ReactNode) => <strong>{chunks}</strong>;

const INSTRUCTION_POINTER_MOVE_THRESHOLD_PX = 3;

export const DeleteMilestoneModal = ({ data }: DeleteMilestoneModalProps) => {
  const { formatMessage } = useIntl();
  const confirmInstructionId = useId();
  const confirmInputId = useId();
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const instructionPointerRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [useWebKitInstruction] = useState(() => needsLabelTextSelectionFix());
  const { isLoading, deleteMilestone } = useDeleteMilestone();

  const confirmPlaceholder = formatMessage(messages.confirmPlaceholder);

  const handleConfirmTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmText(event.target.value);
  };

  const focusConfirmInput = () => {
    if (isLoading) {
      return;
    }
    confirmInputRef.current?.focus();
  };

  const handleInstructionPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    instructionPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  };

  const handleInstructionPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = instructionPointerRef.current;
    if (!pointer) {
      return;
    }
    if (
      Math.abs(event.clientX - pointer.x) > INSTRUCTION_POINTER_MOVE_THRESHOLD_PX ||
      Math.abs(event.clientY - pointer.y) > INSTRUCTION_POINTER_MOVE_THRESHOLD_PX
    ) {
      pointer.moved = true;
    }
  };

  const handleInstructionClick = () => {
    const pointer = instructionPointerRef.current;
    instructionPointerRef.current = null;
    if (pointer?.moved) {
      return;
    }
    if (window.getSelection()?.toString()) {
      return;
    }
    focusConfirmInput();
  };

  const handleSubmit = () => {
    if (!data || !isDeleteMilestoneConfirmationValid(confirmText)) return;
    deleteMilestone(data.id);
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
          {useWebKitInstruction ? (
            <>
              <div
                id={confirmInstructionId}
                className={cx('delete-milestone-modal__confirm-label')}
                onPointerDown={handleInstructionPointerDown}
                onPointerMove={handleInstructionPointerMove}
                onClick={handleInstructionClick}
              >
                {formatMessage(messages.typeDeleteInstructionLabel)}
              </div>
              <FieldText
                ref={confirmInputRef}
                id={confirmInputId}
                aria-labelledby={confirmInstructionId}
                defaultWidth={false}
                value={confirmText}
                onChange={handleConfirmTextChange}
                placeholder={confirmPlaceholder}
                disabled={isLoading}
              />
            </>
          ) : (
            <FieldText
              label={formatMessage(messages.typeDeleteInstructionLabel)}
              defaultWidth={false}
              value={confirmText}
              onChange={handleConfirmTextChange}
              placeholder={confirmPlaceholder}
              disabled={isLoading}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
