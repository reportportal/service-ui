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

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  MouseEvent as MouseEventFromReact,
  PointerEvent as PointerEventFromReact,
} from 'react';
import { createPortal } from 'react-dom';
import {
  BubblesLoader,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  ExternalLinkIcon,
  DownloadIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';

import { GalleryThumbImage } from '../galleryThumbImage/galleryThumbImage';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import type { AttachmentWithSlider } from '../../types';

import styles from './attachmentsGallerySlider.scss';

const cx = createClassnames(styles);

const ZOOM_STEP = 0.25;
const ZOOM_MAX = 4;
const ZOOM_MIN = 1;

export type AttachmentsGallerySliderProps = {
  isOpen: boolean;
  activeIndex: number;
  attachments: AttachmentWithSlider[];
  mainImageSrc: string;
  getThumbSrc: (attachment: AttachmentWithSlider) => string;
  getFallbackSrc: (attachment: AttachmentWithSlider) => string;
  showZoomExternalDownload: boolean;
  fullImageLoading: boolean;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
  onDownloadCurrent: () => void;
};

type ImageDragOffsetPx = { x: number; y: number };

const IMAGE_DRAG_OFFSET_ZERO: ImageDragOffsetPx = { x: 0, y: 0 };

export const AttachmentsGallerySlider = ({
  isOpen,
  activeIndex,
  attachments,
  mainImageSrc,
  getThumbSrc,
  getFallbackSrc,
  showZoomExternalDownload,
  fullImageLoading,
  onActiveIndexChange,
  onClose,
  onDownloadCurrent,
}: AttachmentsGallerySliderProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageDragOffsetRef = useRef<ImageDragOffsetPx>(IMAGE_DRAG_OFFSET_ZERO);
  const [zoomScale, setZoomScale] = useState(1);
  const [imageDragOffset, setImageDragOffset] = useState<ImageDragOffsetPx>(IMAGE_DRAG_OFFSET_ZERO);
  const [isMainImageFailed, setIsMainImageFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const zoomedImageDragRef = useRef({
    active: false,
    pointerId: 0,
    startX: 0,
    startY: 0,
    offsetAtPointerDown: IMAGE_DRAG_OFFSET_ZERO,
  });
  const wasOpenRef = useRef(false);
  const attachmentCount = attachments.length;

  const goNext = useCallback((): void => {
    if (attachmentCount <= 1) {
      return;
    }

    onActiveIndexChange(activeIndex < attachmentCount - 1 ? activeIndex + 1 : 0);
  }, [activeIndex, attachmentCount, onActiveIndexChange]);

  const goPrev = useCallback((): void => {
    if (attachmentCount <= 1) {
      return;
    }

    onActiveIndexChange(activeIndex > 0 ? activeIndex - 1 : attachmentCount - 1);
  }, [activeIndex, attachmentCount, onActiveIndexChange]);

  const onWindowKeyDown = useCallback((event: globalThis.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();

      return;
    }

    if (attachmentCount <= 1) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  }, [onClose, goNext, goPrev, attachmentCount]);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const animationFrame = requestAnimationFrame(() => {
        overlayRef.current?.focus();
      });
      wasOpenRef.current = true;

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (!isOpen) {
      wasOpenRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setZoomScale(ZOOM_MIN);
     
    setImageDragOffset(IMAGE_DRAG_OFFSET_ZERO);
  }, [activeIndex]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMainImageFailed(false);
  }, [activeIndex, mainImageSrc]);

  useEffect(() => {
    imageDragOffsetRef.current = imageDragOffset;
  }, [imageDragOffset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.addEventListener('keydown', onWindowKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown, true);
    };
  }, [isOpen, onWindowKeyDown]);

  const zoomIn = useCallback((): void => {
    setZoomScale((currentZoom) => Math.min(ZOOM_MAX, currentZoom + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback((): void => {
    setZoomScale((currentZoom) => {
      const nextZoom = Math.max(ZOOM_MIN, currentZoom - ZOOM_STEP);

      if (nextZoom <= ZOOM_MIN) {
        setImageDragOffset(IMAGE_DRAG_OFFSET_ZERO);
      }

      return nextZoom;
    });
  }, []);

  const openExternal = useCallback((): void => {
    if (typeof mainImageSrc === 'string' && mainImageSrc.length > 0) {
      window.open(mainImageSrc, '_blank', 'noopener,noreferrer');
    }
  }, [mainImageSrc]);

  const onZoomedImagePointerDown = useCallback(
    (event: PointerEventFromReact<HTMLDivElement>): void => {
      if (zoomScale <= ZOOM_MIN) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      zoomedImageDragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetAtPointerDown: { ...imageDragOffsetRef.current },
      };
      setIsDragging(true);
    },
    [zoomScale],
  );

  const onZoomedImagePointerMove = useCallback(
    (event: PointerEventFromReact<HTMLDivElement>): void => {
      if (
        !zoomedImageDragRef.current.active ||
        event.pointerId !== zoomedImageDragRef.current.pointerId
      ) {
        return;
      }

      const deltaX = event.clientX - zoomedImageDragRef.current.startX;
      const deltaY = event.clientY - zoomedImageDragRef.current.startY;

      setImageDragOffset({
        x: zoomedImageDragRef.current.offsetAtPointerDown.x + deltaX,
        y: zoomedImageDragRef.current.offsetAtPointerDown.y + deltaY,
      });
    },
    [],
  );

  const onZoomedImagePointerUp = useCallback((event: PointerEventFromReact<HTMLDivElement>): void => {
    if (
      !zoomedImageDragRef.current.active ||
      event.pointerId !== zoomedImageDragRef.current.pointerId
    ) {
      return;
    }

    zoomedImageDragRef.current.active = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (err) {
      console.error(`Zooming error: ${err}`);
    }

    setIsDragging(false);
  }, []);

  const activeAttachment =
    isOpen && attachmentCount > 0 ? attachments[activeIndex] : undefined;
  const mainFallbackSrc = activeAttachment ? getFallbackSrc(activeAttachment) : '';

  const onMainImageError = useCallback(
    (): void => {
      if (isMainImageFailed || !mainImageSrc || mainImageSrc === mainFallbackSrc) {
        return;
      }

      setIsMainImageFailed(true);
    },
    [isMainImageFailed, mainImageSrc, mainFallbackSrc],
  );

  if (!isOpen || attachmentCount === 0) {
    return null;
  }

  const handleZoomOut = (event: MouseEventFromReact<HTMLButtonElement>): void => {
    event.stopPropagation();
    zoomOut();
  };

  const handleZoomIn = (event: MouseEventFromReact<HTMLButtonElement>): void => {
    event.stopPropagation();
    zoomIn();
  };

  const handleDownload = (event: MouseEventFromReact<HTMLButtonElement>): void => {
    event.stopPropagation();
    void onDownloadCurrent();
  };

  const handleOpenInNewTab = (event: MouseEventFromReact<HTMLButtonElement>): void => {
    event.stopPropagation();
    openExternal();
  };

  const handleClose = (event: MouseEventFromReact<HTMLButtonElement>): void => {
    event.stopPropagation();
    onClose();
  };

  const handleShowPrevImage = (event: MouseEventFromReact<HTMLButtonElement>): void => {
    event.stopPropagation();
    goPrev();
  };

  const isSingleAttachment = attachmentCount === 1;
  const needsFullResImage = Boolean(activeAttachment?.hasThumbnail);
  const awaitingFullImage = needsFullResImage && fullImageLoading && !mainImageSrc;
  const mainDisplaySrc =
    !mainImageSrc || isMainImageFailed ? mainFallbackSrc : mainImageSrc;
  const slideKey = `${activeIndex}-${awaitingFullImage ? 'loading' : mainDisplaySrc}`;
  const canDragZoomedImage = zoomScale > ZOOM_MIN;
  const showMainImage = !awaitingFullImage;

  return createPortal(
    <div
      ref={overlayRef}
      tabIndex={-1}
      className={cx('overlay', { singleItem: isSingleAttachment })}
    >
      <div className={styles.backdrop} />
      <div className={styles.toolbar}>
        <button
          className={cx('toolbarButton', 'toolbarButtonZoomMinus', {
            toolbarButtonHidden: !showZoomExternalDownload,
          })}
          onClick={handleZoomOut}
        >
          <MinusIcon />
        </button>
        <button
          className={cx('toolbarButton', 'toolbarButtonZoomPlus', {
            toolbarButtonHidden: !showZoomExternalDownload,
          })}
          onClick={handleZoomIn}
        >
          <PlusIcon />
        </button>
        <button
          className={cx('toolbarButton')}
          onClick={handleDownload}
        >
          <DownloadIcon />
        </button>
        <button
          className={cx('toolbarButton', {
            toolbarButtonHidden: !showZoomExternalDownload,
          })}
          onClick={handleOpenInNewTab}
        >
          <ExternalLinkIcon />
        </button>
        <button
          className={cx('toolbarButton', 'toolbarButtonClose')}
          onClick={handleClose}
        >
          <CloseIcon />
        </button>
      </div>
      <div className={styles.stageRow}>
        <button
          className={cx('navButton', 'navPrev')}
          onClick={handleShowPrevImage}
        >
          <ArrowLeftIcon />
        </button>
        <div className={styles.stage}>
          <div
            className={cx('slideHost', {
              slideHostPending: awaitingFullImage && !isMainImageFailed,
            })}
          >
            {awaitingFullImage && (
              <div className={styles.fullImageLoading}>
                <BubblesLoader />
              </div>
            )}
            <div
              className={cx('zoomedImageViewport', {
                zoomedImageViewportDragging: isDragging,
                zoomedImageViewportDraggable: canDragZoomedImage,
              })}
              onPointerDown={onZoomedImagePointerDown}
              onPointerMove={onZoomedImagePointerMove}
              onPointerUp={onZoomedImagePointerUp}
              onPointerCancel={onZoomedImagePointerUp}
            >
              <div
                key={slideKey}
                className={cx('zoomedImageLayer')}
                style={{
                  transform: `translate(${imageDragOffset.x}px, ${imageDragOffset.y}px) scale(${zoomScale})`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
              >
                {showMainImage && (
                  <img
                    className={styles.mainImage}
                    src={mainDisplaySrc}
                    alt={activeAttachment?.fileName ?? ''}
                    draggable={false}
                    onError={onMainImageError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={cx('navButton', 'navNext')}
          aria-label="Next"
          onClick={(event: MouseEventFromReact<HTMLButtonElement>) => {
            event.stopPropagation();
            goNext();
          }}
        >
          <ArrowRightIcon />
        </button>
      </div>
      <div className={styles.thumbs}>
        <div className={styles.thumbsTrack}>
          {attachments.map((attachment, thumbIndex) => (
            <button
              key={attachment.id}
              type="button"
              className={cx('thumbButton', { thumbActive: thumbIndex === activeIndex })}
              onClick={(event: MouseEventFromReact<HTMLButtonElement>) => {
                event.stopPropagation();
                onActiveIndexChange(thumbIndex);
              }}
            >
              <GalleryThumbImage
                key={`${attachment.id}-${getThumbSrc(attachment)}`}
                attachment={attachment}
                getThumbSrc={getThumbSrc}
                getFallbackSrc={getFallbackSrc}
              />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};
