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

import { AttachedFile } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { Attachment } from 'pages/inside/testCaseLibraryPage/types';

import styles from './attachmentsList.scss';

const cx = createClassnames(styles);

interface AttachmentsListProps {
  attachments: Attachment[];
  className?: string;
}

export const AttachmentList = ({ attachments, className = '' }: AttachmentsListProps) => {
  const convertBytesToMB = (bytes: number) => Math.round((bytes / (1000 * 1000)) * 100) / 100;

  return (
    <div className={cx('attachments-list', className)}>
      {attachments.map(({ id, fileName, fileSize }) => (
        <AttachedFile key={id} fileName={fileName} size={convertBytesToMB(fileSize)} isFullWidth />
      ))}
    </div>
  );
};
