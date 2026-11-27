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

import { isBoolean } from 'es-toolkit';

import type { AttachmentWithSlider } from './types';

export const getFileExtension = (fileName: string | undefined): string | undefined =>
  fileName?.split('.').pop()?.toLowerCase();

// The server makes TMS attachment thumbnails only for PNG and JPEG uploads.
const THUMBNAIL_FILE_TYPES = new Set(['image/png', 'image/jpeg']);

/**
 * Execution comment attachments come without `hasThumbnail`; the server still has thumbnails
 * for their PNG and JPEG files. Use the flag when it is set, otherwise decide by the file type.
 */
export const withThumbnailFlag = (attachment: AttachmentWithSlider): AttachmentWithSlider =>
  isBoolean(attachment.hasThumbnail)
    ? attachment
    : {
        ...attachment,
        hasThumbnail: THUMBNAIL_FILE_TYPES.has(attachment.fileType),
      };

export const applyFullImageStateForAttachment = (
  attachment: AttachmentWithSlider | undefined,
  fullImageCache: Map<number, string>,
  setGalleryFullImageUrl: (url: string | null) => void,
  setGalleryFullImageLoading: (loading: boolean) => void,
): boolean => {
  if (!attachment) {
    return false;
  }

  if (!attachment.hasThumbnail) {
    setGalleryFullImageUrl(null);
    setGalleryFullImageLoading(false);

    return false;
  }

  const cachedUrl = fullImageCache.get(attachment.id);

  if (cachedUrl) {
    setGalleryFullImageUrl(cachedUrl);
    setGalleryFullImageLoading(false);

    return false;
  }

  setGalleryFullImageUrl(null);
  setGalleryFullImageLoading(true);

  return true;
};
