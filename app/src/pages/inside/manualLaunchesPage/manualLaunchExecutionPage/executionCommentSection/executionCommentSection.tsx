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

import { FC, useMemo, useRef, useState, FormEventHandler, ChangeEventHandler } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  DragAndDropIcon,
  FieldTextFlex,
  FileDropArea,
  PlusIcon,
} from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { MAX_FILE_SIZE } from 'common/constants/fileConstants';
import { useTextareaAutoResize } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import {
  updateManualLaunchExecutionCommentAction,
  type TestCaseExecution,
} from 'controllers/manualLaunch';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import { useFileAttachments } from 'hooks/useFileAttachments';

import { messages as statusModalMessages } from '../executionStatusConfirmModal/messages';
import { messages } from '../messages';
import { commonMessages } from 'pages/inside/common/common-messages';

import styles from './executionCommentSection.scss';
import {
  EXECUTION_COMMENT_ACCEPT_MIME_TYPES,
  EXECUTION_COMMENT_MAX_LENGTH,
  EXECUTION_COMMENT_TEXTAREA_MIN_HEIGHT,
} from './constants';

const cx = createClassnames(styles);

export interface ExecutionCommentSectionProps {
  execution: TestCaseExecution;
}

export const ExecutionCommentSection: FC<ExecutionCommentSectionProps> = ({ execution }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const launchId = useManualLaunchId();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useTextareaAutoResize(textareaRef);

  const savedComment = execution.executionComment?.comment ?? '';

  const [prevExecutionId, setPrevExecutionId] = useState(execution.id);
  const [comment, setComment] = useState(savedComment);
  const [isSaving, setIsSaving] = useState(false);

  const {
    pendingFiles,
    removedAttachmentIds,
    visibleExistingAttachments,
    existingAttachmentsData,
    pendingFilesData,
    handleFilesAdded: handleFilesAddedFromHook,
    handlePendingRemove,
    handleExistingRemove,
    setPendingFiles,
    setRemovedAttachmentIds,
  } = useFileAttachments({
    resetKey: String(execution.id),
    existingAttachments: execution.executionComment?.attachments ?? [],
    messages,
  });

  if (execution.id !== prevExecutionId) {
    setPrevExecutionId(execution.id);
    setComment(savedComment);
  }

  const isDirty = useMemo(() => {
    const savedTrimmed = savedComment.trim();
    const draftTrimmed = comment.trim();
    return (
      draftTrimmed !== savedTrimmed || !isEmpty(pendingFiles) || !isEmpty(removedAttachmentIds)
    );
  }, [comment, pendingFiles, removedAttachmentIds, savedComment]);

  const hasClearableContent = useMemo(
    () =>
      !isEmpty(comment.trim()) || !isEmpty(pendingFiles) || !isEmpty(visibleExistingAttachments),
    [comment, pendingFiles, visibleExistingAttachments],
  );

  const handleCommentChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setComment(e.target.value);
  };

  const handleFilesAdded = (
    filesWithValidation: Parameters<typeof handleFilesAddedFromHook>[0],
  ) => {
    handleFilesAddedFromHook(filesWithValidation);

    const uniqueFiles = filesWithValidation
      .map((f) => f.file)
      .filter(
        (f) =>
          f.size > 0 &&
          !visibleExistingAttachments.some(
            (a) => a.fileName.toLowerCase() === f.name.toLowerCase(),
          ) &&
          !pendingFiles.some((pf) => pf.name.toLowerCase() === f.name.toLowerCase()),
      );

    if (isEmpty(uniqueFiles) || !launchId || isSaving) return;

    setPendingFiles((prev) => [...prev, ...uniqueFiles]);
    setIsSaving(true);
    dispatch(
      updateManualLaunchExecutionCommentAction({
        projectKey,
        launchId,
        executionId: execution.id,
        executionStatus: execution.executionStatus,
        comment,
        existingAttachments: execution.executionComment?.attachments ?? [],
        newFiles: uniqueFiles,
        removedAttachmentIds: Array.from(removedAttachmentIds),
        btsTickets: execution.executionComment?.btsTickets,
        onSuccess: () => {
          setPendingFiles([]);
          setRemovedAttachmentIds(new Set());
        },
        onFinally: () => setIsSaving(false),
      }),
    );
  };

  const handleExistingRemoveWithSave = (id: string | number) => {
    handleExistingRemove(id);
    if (!launchId || isSaving) return;
    const nextRemoved = new Set([...removedAttachmentIds, String(id)]);
    setRemovedAttachmentIds(nextRemoved);
    setIsSaving(true);
    dispatch(
      updateManualLaunchExecutionCommentAction({
        projectKey,
        launchId,
        executionId: execution.id,
        executionStatus: execution.executionStatus,
        comment,
        existingAttachments: execution.executionComment?.attachments ?? [],
        newFiles: [],
        removedAttachmentIds: Array.from(nextRemoved),
        btsTickets: execution.executionComment?.btsTickets,
        onSuccess: () => setRemovedAttachmentIds(new Set()),
        onFinally: () => setIsSaving(false),
      }),
    );
  };

  const handleClearLocal = () => {
    setComment('');
    setPendingFiles([]);
    setRemovedAttachmentIds(
      new Set((execution.executionComment?.attachments ?? []).map((a) => String(a.id))),
    );
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!launchId || isSaving || !isDirty) return;

    setIsSaving(true);
    dispatch(
      updateManualLaunchExecutionCommentAction({
        projectKey,
        launchId,
        executionId: execution.id,
        executionStatus: execution.executionStatus,
        comment,
        existingAttachments: execution.executionComment?.attachments ?? [],
        newFiles: pendingFiles,
        removedAttachmentIds: Array.from(removedAttachmentIds),
        btsTickets: execution.executionComment?.btsTickets,
        onSuccess: () => {
          setPendingFiles([]);
          setRemovedAttachmentIds(new Set());
        },
        onFinally: () => setIsSaving(false),
      }),
    );
  };

  return (
    <section className={cx('execution-comment-section')}>
      <form className={cx('execution-comment-section__form')} onSubmit={handleSubmit}>
        <div className={cx('execution-comment-section__body')}>
          <div className={cx('execution-comment-section__comment-block')}>
            <FieldTextFlex
              ref={textareaRef}
              label={formatMessage(messages.executionCommentTitle)}
              placeholder={formatMessage(statusModalMessages.commentPlaceholder)}
              value={comment}
              onChange={handleCommentChange}
              minHeight={EXECUTION_COMMENT_TEXTAREA_MIN_HEIGHT}
              maxLength={EXECUTION_COMMENT_MAX_LENGTH}
              disabled={isSaving}
              className={cx('execution-comment-section__comment')}
            />
            <div className={cx('execution-comment-section__counter')}>
              {comment.length}/{EXECUTION_COMMENT_MAX_LENGTH}
            </div>
          </div>
          <div className={cx('execution-comment-section__footer')}>
            <Button
              type="button"
              variant="ghost"
              className={cx('execution-comment-section__clear')}
              disabled={isSaving || !hasClearableContent}
              onClick={handleClearLocal}
            >
              {formatMessage(messages.clearExecutionComment)}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || !isDirty}
              className={cx('execution-comment-section__save')}
            >
              {formatMessage(messages.saveExecutionComment)}
            </Button>
          </div>
        </div>
        <div className={cx('execution-comment-section__divider')} />
        <div className={cx('execution-comment-section__attachments')}>
          <div className={cx('attachments-file-drop')}>
            <FileDropArea
              variant="overlay"
              maxFileSize={MAX_FILE_SIZE}
              acceptFileMimeTypes={EXECUTION_COMMENT_ACCEPT_MIME_TYPES}
              isDisabled={isSaving}
              onFilesAdded={handleFilesAdded}
              messages={{
                incorrectFileSize: formatMessage(statusModalMessages.incorrectFileSize),
                incorrectFileFormat: formatMessage(statusModalMessages.incorrectFileFormat),
              }}
            >
              <FileDropArea.DropZone className={cx('attachments-block__dropzone')} icon={<div />} />
              <div className={cx('attachments-block__header')}>
                <span className={cx('attachments-block__title')}>
                  {formatMessage(commonMessages.attachments)}
                </span>
                <div className={cx('attachments-block__add')}>
                  <span className={cx('attachments-block__hint')}>
                    <DragAndDropIcon />
                    <span className={cx('attachments-block__hint-text')}>
                      {formatMessage(statusModalMessages.dropFilesHere)}
                    </span>
                  </span>
                  <FileDropArea.BrowseButton icon={<PlusIcon />}>
                    {formatMessage(statusModalMessages.add)}
                  </FileDropArea.BrowseButton>
                </div>
              </div>
              {!isEmpty(existingAttachmentsData) && (
                <FileDropArea.AttachedFilesList
                  className={cx('attachments-block__list')}
                  files={existingAttachmentsData}
                  onRemoveFile={(id) => handleExistingRemoveWithSave(id)}
                />
              )}
              {!isEmpty(pendingFilesData) && (
                <FileDropArea.AttachedFilesList
                  className={cx('attachments-block__list')}
                  files={pendingFilesData}
                  onRemoveFile={handlePendingRemove}
                />
              )}
            </FileDropArea>{' '}
          </div>{' '}
        </div>
      </form>
    </section>
  );
};
