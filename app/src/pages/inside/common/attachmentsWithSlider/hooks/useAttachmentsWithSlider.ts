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

import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { AttachmentWithSlider } from 'pages/inside/common/attachmentsWithSlider/types';

export const useAttachmentsWithSlider = () => {
  const projectKey = useSelector(projectKeySelector);

  const getAttachmentThumbnailOnly = useCallback(
    async (
      attachment: AttachmentWithSlider,
      objectUrls: string[],
      abortSignal: AbortSignal,
    ): Promise<AttachmentWithSlider> => {
      try {
        const thumbnailResult = await fetch(
          URLS.attachmentThumbnail(projectKey, attachment.id),
          { responseType: 'blob', signal: abortSignal },
          true,
        );

        if (abortSignal.aborted || !thumbnailResult) {
          return { ...attachment };
        }

        const thumbnailSrc = URL.createObjectURL(thumbnailResult.data as MediaSource);

        objectUrls.push(thumbnailSrc);

        return {
          ...attachment,
          thumbnailSrc,
        };
      } catch {
        return { ...attachment };
      }
    },
    [projectKey],
  );

  const fetchAttachmentFullImage = useCallback(
    async (attachmentId: number, abortSignal: AbortSignal): Promise<string | undefined> => {
      try {
        const imageResult = await fetch(
          URLS.tmsAttachmentDownload(projectKey, attachmentId),
          { responseType: 'blob', signal: abortSignal },
          true,
        );

        if (abortSignal.aborted || !imageResult) {
          return undefined;
        }

        return URL.createObjectURL(imageResult.data as MediaSource);
      } catch {
        return undefined;
      }
    },
    [projectKey],
  );

  const downloadAttachment = useCallback(async (attachmentId: string, fileName: string): Promise<void> => {
    try {
      const response = await fetch(
        URLS.tmsAttachmentDownload(projectKey, attachmentId),
        { responseType: 'blob' },
        true,
      );

      saveAs(response.data as Blob, fileName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [projectKey]);

  return {
    getAttachmentThumbnailOnly,
    fetchAttachmentFullImage,
    downloadAttachment,
  };
};
