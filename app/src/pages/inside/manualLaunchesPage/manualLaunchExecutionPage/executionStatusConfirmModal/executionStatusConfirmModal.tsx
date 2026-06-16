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

import { FC, useState, useEffect, FormEvent, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { reduxForm, InjectedFormProps, initialize } from 'redux-form';
import {
  Modal,
  FileDropArea,
  FieldTextFlex,
  PlusIcon,
  DragAndDropIcon,
} from '@reportportal/ui-kit';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';
import { VoidFn } from '@reportportal/ui-kit/common';

import { withModal, hideModalAction } from 'controllers/modal';
import { createClassnames } from 'common/utils';
import { isString } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import { useFileAttachments } from 'hooks/useFileAttachments';
import {
  updateManualLaunchExecutionStatusAction,
  activeManualLaunchExecutionSelector,
} from 'controllers/manualLaunch';
import { projectKeySelector } from 'controllers/project';
import { availableBtsIntegrationsSelector } from 'controllers/plugins';
import { MAX_FILE_SIZE } from 'common/constants/fileConstants';
import { useModalButtons } from 'hooks/useModalButtons';
import { useTextareaAutoResize } from 'common/hooks';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';
import {
  MANUAL_LAUNCHES_PAGE_EVENTS,
  type ExecutionStatusType as AnalyticsExecutionStatusType,
} from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';
import { useUserPermissions } from 'hooks/useUserPermissions';

import type { ExecutionStatusConfirmFormValues, ExecutionStatusConfirmModalProps } from '../types';
import {
  EXECUTION_STATUS_CONFIRM_MODAL,
  EXECUTION_STATUS_CONFIRM_FORM_NAME,
  STATUS_CONFIG,
  EXECUTION_STATUS_FAILED,
} from '../constants';
import { messages } from './messages';
import { messages as commonMessages } from '../messages';
import { useBTSIssuesModal } from '../BTSIssuesModal/useBTSIssuesModal';

import styles from './executionStatusConfirmModal.scss';

const cx = createClassnames(styles);

const ExecutionStatusConfirmModalComponent: FC<
  ExecutionStatusConfirmModalProps &
    InjectedFormProps<ExecutionStatusConfirmFormValues, ExecutionStatusConfirmModalProps>
> = ({ data, handleSubmit, invalid, dirty }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { canManageExecutions } = useUserPermissions();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const launchId = useManualLaunchId();
  const activeExecution = useSelector(activeManualLaunchExecutionSelector);
  const availableBtsIntegrations = useSelector(availableBtsIntegrationsSelector);

  const modalKey = `${data?.executionId}-${data?.status}-${data?.currentStatus}`;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useTextareaAutoResize(textareaRef);
  const { openModal } = useBTSIssuesModal();

  const status = data?.status || 'passed';
  const isClearStatus = status === ExecutionStatus.TO_RUN;
  const executionId = data?.executionId;

  const {
    pendingFiles: attachedFiles,
    removedAttachmentIds: removedServerAttachmentIds,
    existingAttachmentsData,
    pendingFilesData,
    handleFilesAdded,
    handlePendingRemove: handleFileRemove,
    handleExistingRemove: handleServerAttachmentRemove,
  } = useFileAttachments({
    resetKey: modalKey,
    existingAttachments:
      executionId && activeExecution?.id === executionId
        ? (activeExecution.executionComment?.attachments ?? [])
        : [],
    messages: {
      duplicateFileNames: commonMessages.duplicateFileNames,
      emptyFiles: commonMessages.emptyFiles,
    },
  });
  const currentStatus = data?.currentStatus;
  const statusLabel = isClearStatus ? '' : formatMessage(STATUS_CONFIG[status]?.label);
  const title = isClearStatus
    ? formatMessage(messages.clearStatus)
    : formatMessage(messages.markAsStatus, { status: statusLabel });
  const isStatusChange = currentStatus && !isClearStatus;
  const showPostIssueToBts =
    canManageExecutions && status === EXECUTION_STATUS_FAILED && !isEmpty(availableBtsIntegrations);
  const okButtonLabel = isClearStatus
    ? formatMessage(messages.clearStatus)
    : formatMessage(messages.markAsStatus, { status: statusLabel });

  const shouldSeedCommentForm = !isStatusChange && !isClearStatus;

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

  const onSubmit = (values: ExecutionStatusConfirmFormValues) => {
    if (!executionId) return;

    const clearValue = values.clearCommentAndLinksToBTS as boolean | string | undefined;
    const clearCommentCheckboxChecked = isString(clearValue)
      ? clearValue.toLowerCase() === 'true'
      : clearValue === true;

    if (isClearStatus) {
      trackEvent(MANUAL_LAUNCHES_PAGE_EVENTS.CLICK_CLEAR_TEST_STATUS);
    } else if (data?.place) {
      trackEvent(
        MANUAL_LAUNCHES_PAGE_EVENTS.chooseExecutionStatus(
          data.place,
          status as AnalyticsExecutionStatusType,
        ),
      );
    }

    const shouldOpenBtsModal = values.postIssueToBts && !clearCommentCheckboxChecked;

    setIsSubmitting(true);
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
        onSuccess: () => {
          if (shouldOpenBtsModal) {
            openModal(executionId);
          } else {
            dispatch(hideModalAction());
          }
        },
        onFinally: () => setIsSubmitting(false),
      }),
    );
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: okButtonLabel,
    isLoading: isSubmitting,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  if (!data) {
    return null;
  }

  return (
    <Modal
      title={title}
      onClose={isSubmitting ? undefined : hideModal}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty && !isSubmitting}
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
                  <InputCheckbox>{formatMessage(commonMessages.postIssueToBts)}</InputCheckbox>
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
                  <InputCheckbox>{formatMessage(commonMessages.postIssueToBts)}</InputCheckbox>
                </FieldProvider>
              </div>
            )}

            {showPostIssueToBts && <div className={cx('divider')} />}

            <div className={cx('attachments-section')}>
              <div className={cx('attachments-file-drop')}>
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
                  {!isEmpty(existingAttachmentsData) && (
                    <FileDropArea.AttachedFilesList
                      className={cx('attachments-list')}
                      files={existingAttachmentsData}
                      onRemoveFile={(id) => handleServerAttachmentRemove(id)}
                    />
                  )}
                  {!isEmpty(pendingFilesData) && (
                    <FileDropArea.AttachedFilesList
                      className={cx('attachments-list')}
                      files={pendingFilesData}
                      onRemoveFile={handleFileRemove}
                    />
                  )}
                </FileDropArea>{' '}
              </div>{' '}
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
