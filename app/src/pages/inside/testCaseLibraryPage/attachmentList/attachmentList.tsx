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

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { projectKeySelector } from 'controllers/project';
import { isEmpty } from 'es-toolkit/compat';
import { AttachedFile } from '@reportportal/ui-kit';

import { createClassnames, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { Attachment } from 'pages/inside/testCaseLibraryPage/types';

import styles from './attachmentsList.scss';

const cx = createClassnames(styles);

interface AttachmentsListProps {
  attachments: Attachment[];
  className?: string;
  withPreview?: boolean;
}

export const AttachmentList = ({
  attachments,
  className = '',
  withPreview = false,
}: AttachmentsListProps) => {
  const convertBytesToMB = (bytes: number) => Math.round((bytes / (1000 * 1000)) * 100) / 100;
  const projectKey = useSelector(projectKeySelector);
  const [attachmentsWithPreview, setAttachmentsWithPreview] = useState<Attachment[] | null>(null);
  const getAttachmentWithThumbnail = async (attachment: Attachment, objectUrls: string[]) => {
    try {
      const response = await fetch(
        URLS.attachmentThumbnail(projectKey, attachment.id),
        { responseType: 'blob' },
        true
      );
      const src = URL.createObjectURL(response.data as MediaSource);

      objectUrls.push(src);

      return {
        ...attachment,
        src,
      }
    } catch {
      return { ...attachment };
    }
  };

  useEffect(() => {
    let isMounted = true;
    const objectUrls: string[] = [];
    setAttachmentsWithPreview(null);

    if (withPreview && !isEmpty(attachments)) {
      const promises = attachments.map(async (attachment) => {
        if (attachment.hasThumbnail) {
          return getAttachmentWithThumbnail(attachment, objectUrls);
        } else {
          return { ...attachment };
        }
      });

      void Promise.all(promises).then((newList) => {
        if (isMounted) {
          setAttachmentsWithPreview(newList);
        }
      });
    }

    return () => {
      isMounted = false;
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [withPreview, attachments]);

  const displayedAttachments =
    withPreview && attachmentsWithPreview ? attachmentsWithPreview : attachments;

  return (
    <div className={cx('attachments-list', className)}>
      {displayedAttachments.map(({ id, fileName, fileSize, src }) => (
        <AttachedFile
          key={id}
          fileName={fileName}
          size={convertBytesToMB(fileSize)}
          withPreview={withPreview}
          textPosition={withPreview ? 'bottom' : 'right'}
          imageSrc={src}
          isFullWidth
        />
      ))}
    </div>
  );
};
