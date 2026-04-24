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

import { useCallback, useEffect, useLayoutEffect, useRef, useState, MutableRefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { isEmpty } from 'es-toolkit/compat';
import {
  CsvIcon,
  ImageIcon,
  JarIcon,
  PdfIcon,
  XlsIcon,
  FileOtherIcon,
} from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';

import { svgToBase64 } from '../utils';
import type { AttachmentWithSlider } from './types';
import { applyFullImageStateForAttachment } from './utils';
import { useAttachmentsWithSlider } from './hooks/useAttachmentsWithSlider';
import { GalleryAttachmentTile } from './components/galleryAttachmentTile/galleryAttachmentTile';
import { AttachmentsGallerySlider } from './components/attachmentsGallerySlider/attachmentsGallerySlider';

import styles from './attachmentsWithSlider.scss';

const cx = createClassnames(styles);

interface AttachmentWithSliderProps {
  attachments: AttachmentWithSlider[];
  className?: string;
}

const svgFallbacks = {
  csv: CsvIcon,
  jar: JarIcon,
  pdf: PdfIcon,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
  svg: ImageIcon,
  webp: ImageIcon,
  xls: XlsIcon,
  xlsx: XlsIcon,
} as const;

export const AttachmentsWithSlider = ({
  attachments,
  className = '',
}: AttachmentWithSliderProps) => {
  const { fetchAttachmentPreview, fetchFullAttachmentBlob, downloadAttachment } =
    useAttachmentsWithSlider();
  const shouldApplyAttachmentPreviewRef = useRef(true);
  const fullImageCacheRef = useRef<Map<number, string>>(new Map());
  const [attachmentsWithPreview, setAttachmentsWithPreview] = useState<AttachmentWithSlider[] | null>(
    null,
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryFullImageUrl, setGalleryFullImageUrl] = useState<string | null>(null);
  const [galleryFullImageLoading, setGalleryFullImageLoading] = useState(false);
  const displayedAttachments = attachmentsWithPreview || attachments;
  const displayedListRef = useRef<AttachmentWithSlider[]>(displayedAttachments);
  const galleryIndexRef = useRef(galleryIndex);

  useLayoutEffect(() => {
    displayedListRef.current = displayedAttachments;
    galleryIndexRef.current = galleryIndex;
  }, [displayedAttachments, galleryIndex]);

  const revokeFullImageCache = useCallback(() => {
    fullImageCacheRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    fullImageCacheRef.current.clear();
  }, []);

  const getFallbackIcon = (fileExtension: string | undefined): string => {
    const FallbackIcon =
      svgFallbacks[fileExtension as keyof typeof svgFallbacks] || FileOtherIcon;
    const svgFallbackString = renderToStaticMarkup(<FallbackIcon />);

    return svgToBase64(svgFallbackString);
  };

  const getAttachments = useCallback(
    (
      objectUrls: string[],
      abortSignal: AbortSignal,
      shouldApplyResultRef: MutableRefObject<boolean>,
    ): void => {
      setAttachmentsWithPreview(null);

      if (!isEmpty(attachments)) {
        const promises = attachments.map(
          async (attachment: AttachmentWithSlider): Promise<AttachmentWithSlider> =>
            fetchAttachmentPreview(attachment, objectUrls, abortSignal),
        );

        void Promise.all(promises).then((newList) => {
          if (!abortSignal.aborted && shouldApplyResultRef.current) {
            setAttachmentsWithPreview(newList);
          }
        });
      }
    },
    [attachments, fetchAttachmentPreview],
  );

  useEffect(() => {
    const objectUrls: string[] = [];
    const abortController = new AbortController();

    shouldApplyAttachmentPreviewRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAttachments(objectUrls, abortController.signal, shouldApplyAttachmentPreviewRef);

    return () => {
      shouldApplyAttachmentPreviewRef.current = false;
      abortController.abort();
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [getAttachments]);

  useEffect(() => {
    if (!isGalleryOpen) {
      revokeFullImageCache();
      /* eslint-disable react-hooks/set-state-in-effect */
      setGalleryFullImageUrl(null);
      setGalleryFullImageLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isGalleryOpen, revokeFullImageCache]);

  useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const attachment = displayedAttachments[galleryIndex];
    const shouldFetchFullImage = applyFullImageStateForAttachment(
      attachment,
      fullImageCacheRef.current,
      setGalleryFullImageUrl,
      setGalleryFullImageLoading,
    );

    if (!shouldFetchFullImage || !attachment) {
      return;
    }

    const abortController = new AbortController();
    const requestedAttachmentId = attachment.id;

    void fetchFullAttachmentBlob(requestedAttachmentId, abortController.signal)
      .then((blob) => {
        if (abortController.signal.aborted) {
          return;
        }

        if (!blob) {
          console.error('Full-resolution attachment request returned an empty body');

          return;
        }

        const url = URL.createObjectURL(blob);

        fullImageCacheRef.current.set(requestedAttachmentId, url);

        const activeAttachment = displayedListRef.current[galleryIndexRef.current];

        if (activeAttachment?.id === requestedAttachmentId) {
          setGalleryFullImageUrl(url);
        }
      })
      .catch((err) => {
        console.error(`Error while image fetching: ${err}`);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setGalleryFullImageLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [isGalleryOpen, galleryIndex, displayedAttachments, fetchFullAttachmentBlob]);

  const isReady = !!attachmentsWithPreview;

  const primeFullImageStateForIndex = useCallback(
    (index: number) => {
      const attachment = displayedAttachments[index];
      applyFullImageStateForAttachment(
        attachment,
        fullImageCacheRef.current,
        setGalleryFullImageUrl,
        setGalleryFullImageLoading,
      );
    },
    [displayedAttachments],
  );

  const openGallery = useCallback(
    (index: number) => {
      setGalleryIndex(index);
      setIsGalleryOpen(true);
      primeFullImageStateForIndex(index);
    },
    [primeFullImageStateForIndex],
  );

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      setGalleryIndex(index);
      primeFullImageStateForIndex(index);
    },
    [primeFullImageStateForIndex],
  );

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const activeAttachment = displayedAttachments[galleryIndex];
  const extension = activeAttachment?.fileName.split('.').pop()?.toLowerCase();
  const fallbackSrc = getFallbackIcon(extension);
  const mainImageSrc =
    activeAttachment?.hasThumbnail && isGalleryOpen
      ? galleryFullImageUrl || ''
      : fallbackSrc;
  const showZoomExternalDownload = !!(
    mainImageSrc &&
    !mainImageSrc.startsWith('data:image/svg+xml')
  );

  const handleAttachmentDownload = useCallback(async () => {
    const attachment = displayedAttachments[galleryIndex];

    if (attachment) {
      await downloadAttachment(String(attachment.id), attachment.fileName);
    }
  }, [displayedAttachments, galleryIndex, downloadAttachment]);

  return (
    <div className={cx('attachmentsList', className)}>
      {displayedAttachments.map((attachment, index) => (
        <GalleryAttachmentTile
          key={attachment.id}
          attachment={attachment}
          index={index}
          isReady={isReady}
          galleryItemClass={styles.galleryItem}
          onOpen={openGallery}
        />
      ))}
      <AttachmentsGallerySlider
        isOpen={isGalleryOpen}
        activeIndex={galleryIndex}
        attachments={displayedAttachments}
        mainImageSrc={mainImageSrc}
        getThumbSrc={(attachment) =>
          attachment.thumbnailSrc || getFallbackIcon(attachment.fileName.split('.').pop()?.toLowerCase())
        }
        getFallbackSrc={(attachment) => getFallbackIcon(attachment.fileName.split('.').pop()?.toLowerCase())}
        showZoomExternalDownload={showZoomExternalDownload}
        fullImageLoading={galleryFullImageLoading}
        onActiveIndexChange={handleActiveIndexChange}
        onClose={closeGallery}
        onDownloadCurrent={() => {
          void handleAttachmentDownload();
        }}
      />
    </div>
  );
};
