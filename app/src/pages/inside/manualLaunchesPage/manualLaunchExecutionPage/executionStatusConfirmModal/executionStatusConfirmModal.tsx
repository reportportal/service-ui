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

import { FC, useState, FormEvent } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';
import {
  Modal,
  FileDropArea,
  FieldTextFlex,
  PlusIcon,
  DragAndDropIcon,
} from '@reportportal/ui-kit';
import { MIME_TYPES, FileWithValidation } from '@reportportal/ui-kit/fileDropArea';
import { VoidFn } from '@reportportal/ui-kit/common';
import { isEmpty } from 'es-toolkit/compat';

import { withModal, hideModalAction } from 'controllers/modal';
import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import {
  EXECUTION_STATUSES,
  updateManualLaunchExecutionStatusAction,
} from 'controllers/manualLaunch';
import { projectKeySelector } from 'controllers/project';
import { MAX_FILE_SIZE } from 'common/constants/fileConstants';
import { useModalButtons } from 'hooks/useModalButtons';
import {
  EXECUTION_STATUS_CONFIRM_MODAL,
  EXECUTION_STATUS_CONFIRM_FORM_NAME,
  STATUS_CONFIG,
} from 'pages/inside/manualLaunchesPage/constants';

import type {
  ExecutionStatusConfirmFormValues,
  ExecutionStatusConfirmModalProps,
} from '../types';
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

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

  const status = data?.status || EXECUTION_STATUSES.PASSED;
  const executionId = data?.executionId;
  const statusLabel = formatMessage(STATUS_CONFIG[status].label);

  const onSubmit = (values: ExecutionStatusConfirmFormValues) => {
    if (!executionId) return;

    dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey,
        launchId,
        executionId,
        status: status.toUpperCase(),
        comment: values.comment,
        postIssueToBts: values.postIssueToBts,
        attachments: attachedFiles,
      }),
    );
    dispatch(hideModalAction());
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(messages.markAsStatus, { status: statusLabel }),
    isLoading: false,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  if (!data) {
    return null;
  }

  return (
    <Modal
      title={formatMessage(messages.markAsStatus, { status: statusLabel })}
      onClose={hideModal}
      size="large"
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      className={cx('execution-status-confirm-modal')}
    >
      <form
        className={cx('modal-content')}
        onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}
      >
        <div className={cx('comment-section')}>
          <FieldProvider name="comment">
            <FieldErrorHint>
              <FieldTextFlex
                label={formatMessage(messages.executionComment)}
                placeholder={formatMessage(messages.commentPlaceholder)}
                value=""
                minHeight={100}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>

        <div className={cx('checkbox-section')}>
          <FieldProvider name="postIssueToBts">
            <InputCheckbox>{formatMessage(messages.postIssueToBts)}</InputCheckbox>
          </FieldProvider>
        </div>

        <div className={cx('divider')} />

        <div className={cx('attachments-section')}>
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
            <div className={cx('attachment-header')}>
              <span className={cx('attachment-title')}>{formatMessage(messages.attachments)}</span>
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
            <FileDropArea.DropZone icon={<div />} />
          </FileDropArea>
        </div>
      </form>
    </Modal>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const ExecutionStatusConfirmModal = withModal(EXECUTION_STATUS_CONFIRM_MODAL)(
  reduxForm<ExecutionStatusConfirmFormValues, ExecutionStatusConfirmModalProps>({
    form: EXECUTION_STATUS_CONFIRM_FORM_NAME as string,
    destroyOnUnmount: true,
  })(ExecutionStatusConfirmModalComponent),
);
