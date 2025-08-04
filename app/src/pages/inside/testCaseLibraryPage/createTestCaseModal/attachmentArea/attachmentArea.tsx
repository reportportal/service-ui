/*
 * Copyright 2025 EPAM Systems
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

import { ChangeEvent, PropsWithChildren, useCallback, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import isNumber from 'lodash.isnumber';
import isEmpty from 'lodash.isempty';
import Dropzone from 'react-dropzone';
import {
  Button,
  PlusIcon,
  DragAndDropIcon,
  DragNDropIcon,
  DeleteIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@reportportal/ui-kit';

import { AttachmentItem } from 'componentLibrary/attachmentItem';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { uniqueId } from 'common/utils';
import { downloadFileFromBlob, validateFile } from 'common/utils/fileUtils';
import { noop } from 'pages/inside/testCaseLibraryPage/constants';

import { messages } from './messages';

import styles from './attachmentArea.scss';

const cx = classNames.bind(styles);

interface AttachmentFile {
  id: string;
  file: File;
  fileName: string;
  size: number;
  uploadingProgress: number;
  isUploadFailed: boolean;
  isUploading: boolean;
  uploaded: boolean;
}

interface AttachmentAreaProps {
  isDraggable?: boolean;
  index?: number;
  isNumberable?: boolean;
  isDragAndDropIconVisible?: boolean;
  isAttachmentBlockVisible?: boolean;
  maxFileSize?: number;
  acceptFileMimeTypes?: string[];
  onRemove?: () => void;
  onFilesChange?: (files: AttachmentFile[]) => void;
  onMove?: (direction: 'up' | 'down') => void;
}

export const AttachmentArea = ({
  isDraggable = false,
  index,
  isNumberable = true,
  children,
  isDragAndDropIconVisible = true,
  isAttachmentBlockVisible = true,
  maxFileSize = 134217728, // 128MB default
  acceptFileMimeTypes = [],
  onRemove,
  onFilesChange,
  onMove = noop,
}: PropsWithChildren<AttachmentAreaProps>) => {
  const { formatMessage } = useIntl();
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const areaNumber = isNumber(index) ? index + 1 : '';

  const handleFilesChange = useCallback(
    (files: AttachmentFile[]) => {
      setAttachedFiles(files);
      onFilesChange?.(files);
    },
    [onFilesChange],
  );

  const simulateFileUpload = useCallback((fileId: string) => {
    const interval = setInterval(() => {
      setAttachedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, uploadingProgress: Math.min(file.uploadingProgress + 5, 100) }
            : file,
        ),
      );
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setAttachedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, isUploading: false, uploaded: true, uploadingProgress: 100 }
            : file,
        ),
      );
    }, 1000);
  }, []);

  const addFile = useCallback(
    (file: File) => {
      const newFile: AttachmentFile = {
        id: uniqueId(),
        file,
        fileName: file.name,
        size: Math.max(1, Math.round(file.size / (1024 * 1024))), // Convert to MB, minimum 1MB
        uploadingProgress: 0,
        isUploadFailed: false,
        isUploading: true,
        uploaded: false,
      };

      setAttachedFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, newFile];
        handleFilesChange(updatedFiles);
        return updatedFiles;
      });

      simulateFileUpload(newFile.id);
    },
    [handleFilesChange, simulateFileUpload],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      const updatedFiles = attachedFiles.filter((file) => file.id !== fileId);

      handleFilesChange(updatedFiles);
    },
    [attachedFiles, handleFilesChange],
  );

  const downloadFile = useCallback((file: AttachmentFile) => {
    downloadFileFromBlob(file.file, file.fileName);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], _rejectedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const errors = validateFile(
          file,
          { maxFileSize, acceptFileMimeTypes },
          formatMessage,
          messages,
        );

        if (isEmpty(errors)) {
          addFile(file);
          return;
        }
        // eslint-disable-next-line no-console
        console.error('File rejected:', errors);
      });
    },
    [addFile, maxFileSize, acceptFileMimeTypes, formatMessage],
  );

  const handleAddButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;

      if (files) {
        Array.from(files).forEach((file) => {
          const errors = validateFile(
            file,
            { maxFileSize, acceptFileMimeTypes },
            formatMessage,
            messages,
          );

          if (isEmpty(errors)) {
            addFile(file);
          }
        });
      }

      const target = event.target as HTMLInputElement;

      if (target) {
        target.value = '';
      }
    },
    [addFile, maxFileSize, acceptFileMimeTypes, formatMessage],
  );

  return (
    <div className={cx('attachment-area')}>
      {isNumberable && (
        <div className={cx('attachment-area__number')}>
          <div className={cx('attachment-area__drag')}>
            {areaNumber}
            {isDraggable && (
              <>
                <Button
                  variant="text"
                  adjustWidthOn="content"
                  aria-label={formatMessage(messages.moveUp)}
                  onClick={() => onMove('up')}
                >
                  <ArrowUpIcon />
                </Button>
                <Button variant="text" adjustWidthOn="content">
                  <DragNDropIcon />
                </Button>
                <Button
                  variant="text"
                  adjustWidthOn="content"
                  aria-label={formatMessage(messages.moveDown)}
                  onClick={() => onMove('down')}
                >
                  <ArrowDownIcon />
                </Button>
              </>
            )}
          </div>
          {onRemove && (
            <Button variant="text" adjustWidthOn="content" onClick={onRemove}>
              <DeleteIcon />
            </Button>
          )}
        </div>
      )}
      <div className={cx('attachment-area__fields-container')}>
        <div className={cx('attachment-area__fields')}>{children}</div>
        {isAttachmentBlockVisible && (
          <div className={cx('attachment-area__attachment')}>
            <Dropzone
              className={cx('dropzone-area')}
              activeClassName={cx('dropzone-area--active')}
              onDrop={onDrop}
              multiple
              maxSize={maxFileSize}
              accept={acceptFileMimeTypes.join(',')}
            >
              <div className={cx('attachment-header')}>
                <span className={cx('attachment-area__attachment-title')}>
                  {formatMessage(messages.attachments)}
                </span>
                <div className={cx('attachment-area__add-attachment')}>
                  <span className={cx('attachment-area__dropzone-text')}>
                    {isDragAndDropIconVisible && <DragAndDropIcon />}{' '}
                    {formatMessage(messages.dropFilesHere)}
                  </span>
                  <Button
                    variant="text"
                    icon={<PlusIcon />}
                    adjustWidthOn="content"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddButtonClick();
                    }}
                  >
                    {formatMessage(COMMON_LOCALE_KEYS.ADD)}
                  </Button>
                </div>
              </div>
            </Dropzone>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className={cx('hidden-file-input')}
              onChange={handleFileInputChange}
              accept={acceptFileMimeTypes.join(',')}
            />
          </div>
        )}
        {!isEmpty(attachedFiles) && (
          <div className={cx('attachment-area__files-list')}>
            {attachedFiles.map((file) => (
              <AttachmentItem
                key={file.id}
                fileName={file.fileName}
                size={file.size}
                uploadingProgress={file.uploadingProgress}
                isUploadFailed={file.isUploadFailed}
                isUploading={file.isUploading}
                onRemove={() => removeFile(file.id)}
                onDownload={() => downloadFile(file)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
