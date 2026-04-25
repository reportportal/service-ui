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

import classNames from 'classnames';
import { AttachedFile } from '@reportportal/ui-kit';
import { convertBytesToMB } from 'common/utils';

import { EXTERNAL_IMAGE_STATUS, useImageUrlStatus } from '../hooks/useImageUrlStatus';
import type { AttachmentWithSlider } from '../types';

import styles from './galleryAttachmentTile.scss';

export type GalleryAttachmentTileProps = {
  attachment: AttachmentWithSlider;
  index: number;
  isReady: boolean;
  galleryItemClass?: string;
  onOpen: (index: number) => void;
};

export const GalleryAttachmentTile = ({
  attachment,
  index,
  isReady,
  galleryItemClass = '',
  onOpen,
}: GalleryAttachmentTileProps) => {
  const { fileName, fileSize, thumbnailSrc } = attachment;
  const thumbnailLoadStatus = useImageUrlStatus(thumbnailSrc);
  const previewImageSrc =
    thumbnailSrc && thumbnailLoadStatus !== EXTERNAL_IMAGE_STATUS.ERROR ? thumbnailSrc : undefined;

  return (
    <button
      type="button"
      disabled={!isReady}
      className={classNames(galleryItemClass, {
        [styles.notReadyButton]: !isReady,
      })}
      onClick={() => onOpen(index)}
    >
      <AttachedFile
        fileName={fileName}
        size={convertBytesToMB(fileSize)}
        textPosition="bottom"
        imageSrc={previewImageSrc}
        withPreview
        isFullWidth
      />
    </button>
  );
};
