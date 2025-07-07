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
import styles from './attachmentItem.scss';

const cx = classNames.bind(styles);

interface AttachmentItemProps {
  fileName: string;
  size: number;
}

export const AttachmentItem = ({ fileName, size }: AttachmentItemProps) => {
  const getFileExtension = useCallback((name: string): string => {
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }, []);

  const fileExtension = useMemo(() => getFileExtension(fileName), [fileName, getFileExtension]);
  const upperCaseExtension = fileExtension.toUpperCase();

  return (
    <div className={cx('attachment-item')}>
      <div className={cx('attachment-icon')}>
        <div className={cx('file-icon', `file-icon`)}>
          <span className={cx('extension-text')}>{upperCaseExtension}</span>
        </div>
      </div>

      <div className={cx('attachment-info')}>
        <div className={cx('file-name')}>{fileName}</div>
        <div className={cx('file-details')}>
          {upperCaseExtension}, {size} MB
        </div>
      </div>
    </div>
  );
};
