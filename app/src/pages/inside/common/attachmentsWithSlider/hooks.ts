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
import { PromiseStatus } from 'pages/inside/common/constants';
import { projectKeySelector } from 'controllers/project';
import { AttachmentWithSlider } from 'pages/inside/common/attachmentsWithSlider/types';

export const useAttachmentsWithSlider = () => {
  const projectKey = useSelector(projectKeySelector);

  const getAttachmentWithThumbnail = useCallback(async (
    attachment: AttachmentWithSlider,
    objectUrls: string[],
    abortSignal: AbortSignal,
  ): Promise<AttachmentWithSlider> => {
    const thumbnailPromise = fetch(
      URLS.attachmentThumbnail(projectKey, attachment.id),
      { responseType: 'blob', signal: abortSignal },
      true
    );
    const imagePromise = fetch(
      URLS.tmsAttachmentDownload(projectKey, attachment.id),
      { responseType: 'blob', signal: abortSignal },
      true
    );

    const [thumbnailResult, imageResult] = await Promise.allSettled([thumbnailPromise, imagePromise]);

    let thumbnailSrc: string | undefined;
    let src: string | undefined;

    if (!abortSignal.aborted && thumbnailResult.status === PromiseStatus.Fulfilled) {
      thumbnailSrc = URL.createObjectURL(thumbnailResult.value.data as MediaSource);
      objectUrls.push(thumbnailSrc);
    }

    if (!abortSignal.aborted && imageResult.status === PromiseStatus.Fulfilled) {
      src = URL.createObjectURL(imageResult.value.data as MediaSource);
      objectUrls.push(src);
    }

    return {
      ...attachment,
      ...(thumbnailSrc && { thumbnailSrc }),
      ...(src && { src }),
    };
  }, [projectKey]);

  const downloadAttachment = useCallback(async (attachmentId: string, fileName: string): Promise<void> => {
    try {
      const response = await fetch(
        URLS.tmsAttachmentDownload(projectKey, attachmentId),
        { responseType: 'blob' },
        true
      );

      saveAs(response.data as Blob, fileName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [projectKey]);

  return {
    getAttachmentWithThumbnail,
    downloadAttachment,
  };
};
