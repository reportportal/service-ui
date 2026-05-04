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

import { FC, useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, initialize } from 'redux-form';
import {
  Button,
  DeleteIcon,
  Modal,
  FileDropArea,
  FieldTextFlex,
  PlusIcon,
  DragAndDropIcon,
} from '@reportportal/ui-kit';
import { MIME_TYPES, FileWithValidation } from '@reportportal/ui-kit/fileDropArea';
import { VoidFn } from '@reportportal/ui-kit/common';

import { withModal, hideModalAction } from 'controllers/modal';
import { createClassnames } from 'common/utils';
import { isString } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import {
  updateManualLaunchExecutionStatusAction,
  activeManualLaunchExecutionSelector,
} from 'controllers/manualLaunch';
import { projectKeySelector } from 'controllers/project';
import { MAX_FILE_SIZE } from 'common/constants/fileConstants';
import { useModalButtons } from 'hooks/useModalButtons';
import { useTextareaAutoResize } from 'common/hooks';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';
import { AttachmentsWithSlider } from 'pages/inside/common/attachmentsWithSlider';
import { toAttachmentWithSlider } from '../utils';

import type { ExecutionStatusConfirmFormValues, ExecutionStatusConfirmModalProps } from '../types';
import { messages as manualExecutionPageMessages } from '../messages';
import {
  EXECUTION_STATUS_CONFIRM_MODAL,
  EXECUTION_STATUS_CONFIRM_FORM_NAME,
  STATUS_CONFIG,
  EXECUTION_STATUS_FAILED,
} from '../constants';
import { messages } from './messages';

import styles from './executionStatusConfirmModal.scss';

const cx = createClassnames(styles);

const ExecutionStatusConfirmModalComponent: FC<
  ExecutionStatusConfirmModalProps &
    InjectedFormProps<ExecutionStatusConfirmFormValues, ExecutionStatusConfirmModalProps>
> = ({ data, handleSubmit, invalid, dirty }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const launchId = useManualLaunchId();
  const activeExecution = useSelector(activeManualLaunchExecutionSelector);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [removedServerAttachmentIds, setRemovedServerAttachmentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useTextareaAutoResize(textareaRef);

  const handleFilesAdded = (filesWithValidation: FileWithValidation[]) => {
    const files = filesWithValidation.map((f) => f.file);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleFileRemove = (fileId: string) => {
    const index = attachedFiles.findIndex((f, i) => `${f.name}-${i}` === fileId);
    if (index !== -1) {
      setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleServerAttachmentRemove = (id: string | number) => {
    setRemovedServerAttachmentIds((prev) => new Set([...prev, String(id)]));
  };

  const status = data?.status || 'passed';
  const isClearStatus = status === ExecutionStatus.TO_RUN;
  const executionId = data?.executionId;
  const currentStatus = data?.currentStatus;
  const statusLabel = isClearStatus ? '' : formatMessage(STATUS_CONFIG[status]?.label);
  const title = isClearStatus
    ? formatMessage(messages.clearStatus)
    : formatMessage(messages.markAsStatus, { status: statusLabel });
  const isStatusChange = currentStatus && !isClearStatus;
  const showPostIssueToBts = status === EXECUTION_STATUS_FAILED;
  const okButtonLabel = isClearStatus
    ? formatMessage(messages.clearStatus)
    : formatMessage(messages.markAsStatus, { status: statusLabel });

  const shouldSeedCommentForm = !isStatusChange && !isClearStatus;

  const visibleServerAttachments = useMemo(() => {
    if (!executionId || activeExecution?.id !== executionId) return [];
    const list = activeExecution.executionComment?.attachments ?? [];
    return list.filter((a) => !removedServerAttachmentIds.has(String(a.id)));
  }, [
    executionId,
    activeExecution?.id,
    activeExecution?.executionComment?.attachments,
    removedServerAttachmentIds,
  ]);

  useEffect(() => {
    if (!executionId || dirty || !shouldSeedCommentForm) return;

    const comment =
      activeExecution?.id === executionId
        ? String(activeExecution.executionComment?.comment ?? '')
        : '';

    dispatch(
      initialize(EXECUTION_STATUS_CONFIRM_FORM_NAME, {
        comment,
        postIssueToBts: false,
        clearCommentAndLinksToBTS: false,
      }),
    );
  }, [
    executionId,
    shouldSeedCommentForm,
    dirty,
    dispatch,
    activeExecution?.id,
    activeExecution?.executionComment?.comment,
  ]);

  useEffect(() => {
    setAttachedFiles([]);
    setRemovedServerAttachmentIds(new Set());
  }, [data?.executionId, data?.status, data?.currentStatus]);

  const onSubmit = (values: ExecutionStatusConfirmFormValues) => {
    if (!executionId) return;

    const clearValue = values.clearCommentAndLinksToBTS as boolean | string | undefined;
    const clearCommentCheckboxChecked = isString(clearValue)
      ? clearValue.toLowerCase() === 'true'
      : clearValue === true;

    dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey,
        launchId,
        executionId,
        status: status.toUpperCase(),
        comment: clearCommentCheckboxChecked ? '' : values.comment,
        postIssueToBts: clearCommentCheckboxChecked ? false : values.postIssueToBts,
        attachments: clearCommentCheckboxChecked ? [] : attachedFiles,
        clearExecutionCommentAndBts: isClearStatus ? clearCommentCheckboxChecked : undefined,
        preserveExistingCommentIfFormSkipped: isStatusChange,
        ...(!isClearStatus && !isStatusChange
          ? { removedServerAttachmentIds: Array.from(removedServerAttachmentIds) }
          : {}),
      }),
    );
    dispatch(hideModalAction());
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: okButtonLabel,
    isLoading: false,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  if (!data) {
    return null;
  }

  return (
    <Modal
      title={title}
      onClose={hideModal}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      scrollable
      className={cx('execution-status-confirm-modal', {
        'execution-status-confirm-modal--simple': isStatusChange,
      })}
    >
      <form
        className={cx('modal-content')}
        onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}
      >
        {isStatusChange && (
          <>
            <div className={cx('confirmation-text')}>
              <div className={cx('confirmation-question')}>
                {formatMessage(messages.confirmStatusChange, {
                  status: <strong>{statusLabel}</strong>,
                })}
              </div>
              <div className={cx('confirmation-hint')}>
                {formatMessage(messages.updateCommentIfNeeded)}
              </div>
            </div>

            {showPostIssueToBts && (
              <div className={cx('checkbox-section')}>
                <FieldProvider name="postIssueToBts">
                  <InputCheckbox>{formatMessage(messages.postIssueToBts)}</InputCheckbox>
                </FieldProvider>
              </div>
            )}
          </>
        )}

        {!isStatusChange && !isClearStatus && (
          <>
            <div className={cx('comment-section')}>
              <FieldProvider name="comment">
                <FieldErrorHint>
                  <FieldTextFlex
                    ref={textareaRef}
                    label={formatMessage(messages.executionComment)}
                    placeholder={formatMessage(messages.commentPlaceholder)}
                    value=""
                    minHeight={100}
                  />
                </FieldErrorHint>
              </FieldProvider>
            </div>

            {showPostIssueToBts && (
              <div className={cx('checkbox-section')}>
                <FieldProvider name="postIssueToBts">
                  <InputCheckbox>{formatMessage(messages.postIssueToBts)}</InputCheckbox>
                </FieldProvider>
              </div>
            )}

            {showPostIssueToBts && <div className={cx('divider')} />}

            <div className={cx('attachments-section')}>
              {!isEmpty(visibleServerAttachments) && (
                <div className={cx('modal-existing-attachments')}>
                  {visibleServerAttachments.map((att) => (
                    <div
                      key={String(att.id)}
                      className={cx('modal-existing-attachments__row')}
                    >
                      <div className={cx('modal-existing-attachments__preview')}>
                        <AttachmentsWithSlider
                          attachments={[toAttachmentWithSlider(att)]}
                          className={cx('modal-existing-attachments__slider')}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="text"
                        adjustWidthOn="content"
                        className={cx('modal-existing-attachments__remove')}
                        onClick={() => handleServerAttachmentRemove(att.id)}
                        aria-label={formatMessage(
                          manualExecutionPageMessages.removeAttachment,
                        )}
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <FileDropArea
                variant="overlay"
                maxFileSize={MAX_FILE_SIZE}
                acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.pdf]}
                onFilesAdded={handleFilesAdded}
                messages={{
                  incorrectFileSize: formatMessage(messages.incorrectFileSize),
                  incorrectFileFormat: formatMessage(messages.incorrectFileFormat),
                }}
              >
                <FileDropArea.DropZone className={cx('dropzone')} icon={<div />} />
                <div className={cx('attachment-header')}>
                  <span className={cx('attachment-title')}>
                    {formatMessage(messages.attachments)}
                  </span>
                  <div className={cx('add-attachment')}>
                    <span className={cx('dropzone-text')}>
                      <DragAndDropIcon />
                      {formatMessage(messages.dropFilesHere)}
                    </span>
                    <FileDropArea.BrowseButton icon={<PlusIcon />}>
                      {formatMessage(messages.add)}
                    </FileDropArea.BrowseButton>
                  </div>
                </div>
                {!isEmpty(attachedFiles) && (
                  <FileDropArea.AttachedFilesList
                    files={attachedFiles.map((file, index) => ({
                      id: `${file.name}-${index}`,
                      fileName: file.name,
                      file,
                      size: file.size,
                    }))}
                    onRemoveFile={handleFileRemove}
                  />
                )}
              </FileDropArea>
            </div>
          </>
        )}

        {isClearStatus && (
          <div className={cx('confirmation-text')}>
            <div className={cx('confirmation-question')}>
              {formatMessage(messages.clearStatusWarning)}
            </div>

            <div className={cx('checkbox-section')}>
              <FieldProvider name="clearCommentAndLinksToBTS">
                <InputCheckbox>{formatMessage(messages.clearCommentAndLinksToBTS)}</InputCheckbox>
              </FieldProvider>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export const ExecutionStatusConfirmModal = withModal(EXECUTION_STATUS_CONFIRM_MODAL)(
  reduxForm<ExecutionStatusConfirmFormValues, ExecutionStatusConfirmModalProps>({
    form: EXECUTION_STATUS_CONFIRM_FORM_NAME,
    destroyOnUnmount: true,
    initialValues: {
      clearCommentAndLinksToBTS: false,
      postIssueToBts: false,
    },
  })(ExecutionStatusConfirmModalComponent),
);
