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

import { PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';
import { isNumber } from 'es-toolkit/compat';
import { noop } from 'es-toolkit';
import {
  Button,
  PlusIcon,
  DragAndDropIcon,
  DragNDropIcon,
  DeleteIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FileDropArea,
  AddImageIcon,
} from '@reportportal/ui-kit';
import type { MimeType } from '@reportportal/ui-kit/fileDropArea';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { messages as commonMessages } from '../messages';
import { messages as attachmentAreaMessages } from './messages';
import { MAX_FILE_SIZE } from '../constants';
import { useTmsFileUpload } from '../useTmsFileUpload';

import styles from './attachmentArea.scss';

const cx = createClassnames(styles);

interface AttachmentAreaProps {
  formName?: string;
  isDraggable?: boolean;
  index?: number;
  isNumerable?: boolean;
  isDragAndDropIconVisible?: boolean;
  isAttachmentBlockVisible?: boolean;
  maxFileSize?: number;
  acceptFileMimeTypes?: MimeType[];
  dropZoneDescription?: string;
  fileSizeMessage?: string;
  totalCount?: number;
  attachmentFieldName?: string;
  canAttachFiles?: boolean;
  onRemove?: () => void;
  onMove?: (direction: 'up' | 'down') => void;
}

export const AttachmentArea = ({
  formName = '',
  isDraggable = false,
  index,
  isNumerable = true,
  children,
  isDragAndDropIconVisible = true,
  isAttachmentBlockVisible = true,
  maxFileSize = MAX_FILE_SIZE,
  acceptFileMimeTypes = [],
  dropZoneDescription,
  fileSizeMessage,
  totalCount,
  attachmentFieldName = 'attachments',
  canAttachFiles = true,
  onRemove,
  onMove = noop,
}: PropsWithChildren<AttachmentAreaProps>) => {
  const { formatMessage } = useIntl();
  const { attachedFiles, addFiles, removeFile, downloadFile } = useTmsFileUpload({
    formName,
    fieldName: attachmentFieldName,
  });

  const areaNumber = isNumber(index) ? index + 1 : '';
  const isMoveUpDisabled = index === 0;
  const isMoveDownDisabled = totalCount ? index === totalCount - 1 : false;

  return (
    <div className={cx('dropzone-wrapper')}>
      <FileDropArea
        variant="overlay"
        maxFileSize={maxFileSize}
        acceptFileMimeTypes={acceptFileMimeTypes}
        onFilesAdded={addFiles}
        isDisabled={!isAttachmentBlockVisible}
        messages={{
          incorrectFileSize: formatMessage(commonMessages.fileSizeInfo),
          incorrectFileFormat: formatMessage(commonMessages.incorrectFileFormat),
        }}
      >
        <div className={cx('attachment-area')}>
          {isNumerable && (
            <div className={cx('attachment-area__number')}>
              <div className={cx('attachment-area__drag')}>
                {areaNumber}
                {isDraggable && (
                  <>
                    <Button
                      variant="text"
                      adjustWidthOn="content"
                      aria-label={formatMessage(attachmentAreaMessages.moveUp)}
                      onClick={() => onMove('up')}
                      disabled={isMoveUpDisabled}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button variant="text" adjustWidthOn="content">
                      <DragNDropIcon />
                    </Button>
                    <Button
                      variant="text"
                      adjustWidthOn="content"
                      aria-label={formatMessage(attachmentAreaMessages.moveDown)}
                      onClick={() => onMove('down')}
                      disabled={isMoveDownDisabled}
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
              <div className={cx('attachment-area__attachments-container')}>
                <div className={cx('attachment-area__attachment')}>
                  <div className={cx('attachment-header')}>
                    <span className={cx('attachment-area__attachment-title')}>
                      {formatMessage(commonMessages.attachments)}
                    </span>
                    <div className={cx('attachment-area__add-attachment')}>
                      <span className={cx('attachment-area__dropzone-text')}>
                        {isDragAndDropIconVisible && <DragAndDropIcon />}
                        {formatMessage(attachmentAreaMessages.dropFilesHere)}
                      </span>
                      <FileDropArea.BrowseButton icon={<PlusIcon />}>
                        {formatMessage(COMMON_LOCALE_KEYS.ADD)}
                      </FileDropArea.BrowseButton>
                    </div>
                  </div>
                </div>
                <FileDropArea.AttachedFilesList
                  files={attachedFiles}
                  className={cx('attachment-area__files-list')}
                  onRemoveFile={removeFile}
                  onDownloadFile={downloadFile}
                />
              </div>
            )}
          </div>
        </div>
        {canAttachFiles && (
          <FileDropArea.DropZone
            icon={<AddImageIcon />}
            description={dropZoneDescription}
            fileSizeMessage={fileSizeMessage}
          />
        )}
      </FileDropArea>
    </div>
  );
};
