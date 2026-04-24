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

  const fetchAttachmentPreview = useCallback(
    async (
      attachment: AttachmentWithSlider,
      objectUrls: string[],
      abortSignal: AbortSignal,
    ): Promise<AttachmentWithSlider> => {
      if (!attachment.hasThumbnail) {
        return { ...attachment };
      }

      let thumbnailSrc: string | undefined;

      try {
        const thumbnailResponse = await fetch(
          URLS.attachmentThumbnail(projectKey, attachment.id),
          { responseType: 'blob', signal: abortSignal },
          true,
        );

        if (!abortSignal.aborted && thumbnailResponse.data) {
          thumbnailSrc = URL.createObjectURL(thumbnailResponse.data as MediaSource);
          objectUrls.push(thumbnailSrc);
        }
      } catch (err) {
        console.error(`Error while fetching thumbnail: ${err}`)
      }

      return {
        ...attachment,
        ...(thumbnailSrc && { thumbnailSrc }),
      };
    },
    [projectKey],
  );

  const fetchFullAttachmentBlob = useCallback(
    async (attachmentId: number, abortSignal: AbortSignal): Promise<Blob> => {
      try {
        const response = await fetch(
          URLS.tmsAttachmentDownload(projectKey, attachmentId),
          { responseType: 'blob', signal: abortSignal },
          true,
        );

        return response.data as Blob;
      } catch (err) {
        console.error(`Error while fetching image: ${err}`)
      }
    },
    [projectKey],
  );

  const downloadAttachment = useCallback(
    async (attachmentId: string, fileName: string): Promise<void> => {
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
    },
    [projectKey],
  );

  return {
    fetchAttachmentPreview,
    fetchFullAttachmentBlob,
    downloadAttachment,
  };
};
