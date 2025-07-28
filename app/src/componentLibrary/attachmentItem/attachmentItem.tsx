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

import classNames from 'classnames/bind';
import { useCallback, useMemo } from 'react';
import {
  AddCsvIcon,
  AddJarIcon,
  AddImageIcon,
  CloseIcon,
  ExternalLinkIcon,
} from '@reportportal/ui-kit';
import styles from './attachmentItem.scss';

const cx = classNames.bind(styles);

interface AttachmentItemProps {
  fileName: string;
  size: number;
  uploadingProgress?: number;
  uploadFailed?: boolean;
  onRemove?: () => void;
  onDownload?: () => void;
  isUploading?: boolean;
  isFullWidth?: boolean;
}

const FILE_ICON_MAP = {
  csv: AddCsvIcon,
  jar: AddJarIcon,
} as const;

const getFileIconByExtension = (extension: string) => {
  return FILE_ICON_MAP[extension.toLowerCase()] ?? AddImageIcon;
};

export const AttachmentItem = ({
  fileName,
  size,
  uploadingProgress = 0,
  uploadFailed = false,
  onRemove,
  onDownload,
  isUploading = false,
  isFullWidth = false,
}: AttachmentItemProps) => {
  const getFileExtension = useCallback((name: string): string => {
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }, []);

  const fileExtension = useMemo(() => getFileExtension(fileName), [fileName, getFileExtension]);
  const upperCaseExtension = fileExtension.toUpperCase();
  const IconComponent = useMemo(() => getFileIconByExtension(fileExtension), [fileExtension]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove],
  );

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!uploadFailed) {
        onDownload?.();
      }
    },
    [onDownload, uploadFailed],
  );

  return (
    <div
      className={cx('attachment-item', {
        'attachment-item--failed': uploadFailed,
        'attachment-item--uploading': isUploading,
        'attachment-item--full-width': isFullWidth,
      })}
    >
      <div className={cx('attachment-icon')}>
        <div className={cx('file-icon')}>
          <IconComponent />
        </div>
      </div>
      <div className={cx('attachment-info')}>
        <button type="button" className={cx('file-name')} onClick={handleDownload}>
          <span className={cx('name-text')}>{fileName}</span>
          {!isUploading && !uploadFailed && (
            <span className={cx('download-icon')}>
              <ExternalLinkIcon />
            </span>
          )}
        </button>
        {!uploadFailed && (
          <div className={cx('file-details')}>
            {upperCaseExtension}, {size} MB
          </div>
        )}
        {uploadFailed && <div className={cx('upload-failed')}>Upload failed</div>}
      </div>
      {onRemove && (
        <button type="button" className={cx('remove-button')} onClick={handleRemove}>
          <CloseIcon />
        </button>
      )}
      {isUploading && uploadingProgress > 0 && (
        <div className={cx('upload-progress')}>
          <div className={cx('upload-progress-bar')} style={{ width: `${uploadingProgress}%` }} />
        </div>
      )}
    </div>
  );
};
