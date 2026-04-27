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
  FC,
  useEffect,
  useMemo,
  useRef,
  useState,
  FormEventHandler,
  ChangeEventHandler,
} from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  DeleteIcon,
  DragAndDropIcon,
  FieldTextFlex,
  FileDropArea,
  PlusIcon,
} from '@reportportal/ui-kit';
import { MIME_TYPES, FileWithValidation } from '@reportportal/ui-kit/fileDropArea';
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

import { AttachmentsWithSlider } from 'pages/inside/common/attachmentsWithSlider';
import { messages as statusModalMessages } from '../executionStatusConfirmModal/messages';
import { messages } from '../messages';
import { toAttachmentWithSlider } from '../utils';
import { commonMessages } from 'pages/inside/common/common-messages';

import styles from './executionCommentSection.scss';

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

  const [comment, setComment] = useState(savedComment);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setComment(savedComment);
    setPendingFiles([]);
    setRemovedAttachmentIds(new Set());
  }, [execution.id]);

  useEffect(() => {
    setComment(savedComment);
  }, [savedComment]);

  const visibleExistingAttachments = useMemo(() => {
    const list = execution.executionComment?.attachments ?? [];
    return list.filter((a) => !removedAttachmentIds.has(String(a.id)));
  }, [execution.executionComment?.attachments, removedAttachmentIds]);

  const isDirty = useMemo(() => {
    const savedTrimmed = savedComment.trim();
    const draftTrimmed = comment.trim();
    return (
      draftTrimmed !== savedTrimmed ||
      !isEmpty(pendingFiles) ||
      !isEmpty(removedAttachmentIds)
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

  const handleFilesAdded = (filesWithValidation: FileWithValidation[]) => {
    const files = filesWithValidation.map((f) => f.file);
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const handlePendingRemove = (fileId: string) => {
    const index = pendingFiles.findIndex((f, i) => `${f.name}-${i}` === fileId);
    if (index !== -1) {
      setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleExistingRemove = (id: string | number) => {
    setRemovedAttachmentIds((prev) => new Set([...prev, String(id)]));
  };

  const handleClearLocal = () => {
    setComment('');
    setPendingFiles([]);
    setRemovedAttachmentIds(
      new Set(
        (execution.executionComment?.attachments ?? []).map((a) => String(a.id)),
      ),
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
        <FieldTextFlex
          ref={textareaRef}
          label={formatMessage(messages.executionCommentTitle)}
          placeholder={formatMessage(statusModalMessages.commentPlaceholder)}
          value={comment}
          onChange={handleCommentChange}
          minHeight={100}
        />
        <div className={cx('execution-comment-section__divider')} />
        <div className={cx('attachments-block')}>
          <FileDropArea
            variant="overlay"
            maxFileSize={MAX_FILE_SIZE}
            acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.pdf]}
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
                  {formatMessage(statusModalMessages.dropFilesHere)}
                </span>
                <FileDropArea.BrowseButton icon={<PlusIcon />}>
                  {formatMessage(statusModalMessages.add)}
                </FileDropArea.BrowseButton>
              </div>
            </div>
            {!isEmpty(visibleExistingAttachments) && (
              <div className={cx('attachments-block__existing')}>
                {visibleExistingAttachments.map((att) => (
                  <div key={String(att.id)} className={cx('attachments-block__existing-row')}>
                    <div className={cx('attachments-block__existing-preview')}>
                      <AttachmentsWithSlider
                        attachments={[toAttachmentWithSlider(att)]}
                        className={cx('attachments-block__slider')}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="text"
                      adjustWidthOn="content"
                      className={cx('attachments-block__remove')}
                      onClick={() => handleExistingRemove(att.id)}
                      aria-label={formatMessage(messages.removeAttachment)}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {!isEmpty(pendingFiles) && (
              <FileDropArea.AttachedFilesList
                files={pendingFiles.map((file, index) => ({
                  id: `${file.name}-${index}`,
                  fileName: file.name,
                  file,
                  size: file.size,
                }))}
                onRemoveFile={handlePendingRemove}
              />
            )}
          </FileDropArea>
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
      </form>
    </section>
  );
};
