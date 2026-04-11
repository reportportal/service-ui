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
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  MutableRefObject,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { isEmpty } from 'es-toolkit/compat';
import {
  AttachedFile,
  CsvIcon,
  ImageIcon,
  JarIcon,
  PdfIcon,
  XlsIcon,
  FileOtherIcon,
} from '@reportportal/ui-kit';
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { createClassnames, convertBytesToMB } from 'common/utils';

import closeIcon from './sliderControls/close-inline.svg';
import zoomPlusIcon from './sliderControls/zoom-plus-inline.svg';
import zoomMinusIcon from './sliderControls/zoom-minus-inline.svg';
import externalLinkIcon from './sliderControls/external-link-inline.svg';
import downloadIcon from './sliderControls/download-inline.svg';
import nextIcon from './sliderControls/next-inline.svg';
import prevIcon from './sliderControls/prev-inline.svg';
import { svgToBase64 } from '../utils';
import {
  AttachmentWithSlider,
  GalleryItem,
  ZoomPlugin,
  ExtendedLightGalleryInstance,
} from './types';
import { useAttachmentsWithSlider } from './hooks/useAttachmentsWithSlider';
import { lightGalleryClassNames } from './constants';
import {
  PENDING_FULL_LOAD_ATTR,
  shouldPendingHideThumbForSlide,
  clearSlidePendingFullLoad,
  loadFullResolutionImageForSlide,
  shouldShowZoomAndExternalLink,
} from './utils';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import styles from './attachmentsWithSlider.scss';

const cx = createClassnames(styles);

const LIGHT_GALLERY_PLUGINS = [lgThumbnail, lgZoom];

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
  const { getAttachmentThumbnailOnly, fetchAttachmentFullImage, downloadAttachment } =
    useAttachmentsWithSlider();
  const downloadAttachmentRef = useRef(downloadAttachment);

  const lightGalleryRef = useRef<ExtendedLightGalleryInstance | null>(null);
  const lgContainerRef = useRef<HTMLDivElement | null>(null);
  const isCleanedUpRef = useRef(false);
  const [attachmentsWithPreview, setAttachmentsWithPreview] = useState<AttachmentWithSlider[] | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const attachmentsListRef = useRef(attachments);
  const fetchAttachmentFullImageRef = useRef(fetchAttachmentFullImage);
  const loadedFullObjectUrlByAttachmentIdRef = useRef<Map<number, string>>(new Map());
  const loadingFullImageAttachmentIdsRef = useRef<Set<number>>(new Set());
  const fullImageFetchAbortRef = useRef<AbortController | null>(null);

  const getFallbackIcon = (fileExtension: string): string => {
    const FallbackIcon = svgFallbacks[fileExtension as keyof typeof svgFallbacks] || FileOtherIcon;
    const svgFallbackString = renderToStaticMarkup(<FallbackIcon />);

    return svgToBase64(svgFallbackString);
  };

  const addThumbnailSrcToAttachments = useCallback(
    (objectUrls: string[], abortSignal: AbortSignal, cleanedUpRef: MutableRefObject<boolean>): void => {
      setAttachmentsWithPreview(null);
      loadedFullObjectUrlByAttachmentIdRef.current.clear();

      if (!isEmpty(attachments)) {
        const promises = attachments.map(
          async (attachment: AttachmentWithSlider): Promise<AttachmentWithSlider> => {
            if (attachment.hasThumbnail) {
              return getAttachmentThumbnailOnly(attachment, objectUrls, abortSignal);
            }

            return { ...attachment };
          },
        );

        void Promise.all(promises).then((newList) => {
          if (!abortSignal.aborted && !cleanedUpRef.current) {
            setAttachmentsWithPreview(newList);
          }
        });
      }
    },
    [attachments, getAttachmentThumbnailOnly],
  );

  useEffect(() => {
    const objectUrls: string[] = [];

    objectUrlsRef.current = objectUrls;
    const abortController = new AbortController();

    isCleanedUpRef.current = false;
    queueMicrotask(() => {
      addThumbnailSrcToAttachments(objectUrls, abortController.signal, isCleanedUpRef);
    });

    return () => {
      isCleanedUpRef.current = true;
      fullImageFetchAbortRef.current?.abort();
      fullImageFetchAbortRef.current = null;
      abortController.abort();
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [addThumbnailSrcToAttachments]);

  const updateImageToolbarVisibility = useCallback(
    (instance: ExtendedLightGalleryInstance, slideIndex: number): void => {
      const outerRoot = instance.outer?.get();
      const zoomInButton = outerRoot?.querySelector(`.${lightGalleryClassNames.zoomIn}`);
      const zoomOutButton = outerRoot?.querySelector(`.${lightGalleryClassNames.zoomOut}`);
      const externalLinkButton = outerRoot?.querySelector(`.${lightGalleryClassNames.externalLink}`);
      const show = shouldShowZoomAndExternalLink(
        instance,
        slideIndex,
        attachmentsListRef.current,
        loadedFullObjectUrlByAttachmentIdRef.current,
      );

      externalLinkButton?.classList.toggle('hidden', !show);
      zoomInButton?.classList.toggle('hidden', !show);
      zoomOutButton?.classList.toggle('hidden', !show);
    },
    [],
  );

  const setTollbarButtonsVisibility = useCallback((instance: ExtendedLightGalleryInstance): void => {
    instance.LGel.on('lgBeforeSlide', (event: { detail: { index: number } }): void => {
      updateImageToolbarVisibility(instance, event.detail.index);
    });
    instance.LGel.on('lgAfterOpen', (): void => {
      updateImageToolbarVisibility(instance, instance.index);
    });
  }, [updateImageToolbarVisibility]);

  const addCustomCloseButton = (toolbar: HTMLElement): void => {
    const closeButton = toolbar.querySelector(`.${lightGalleryClassNames.closeButton}`);

    if (closeButton) {
      closeButton.innerHTML = closeIcon;
    }
  };

  const addCustomExternalLinkButton = (
    toolbar: HTMLElement,
    instance: ExtendedLightGalleryInstance,
  ): void => {
    const externalLinkButton = document.createElement('button');

    externalLinkButton.className = `${lightGalleryClassNames.icon} ${lightGalleryClassNames.externalLink}`;
    externalLinkButton.innerHTML = externalLinkIcon;
    externalLinkButton.onclick = () => {
      const currentItem = instance.galleryItems[instance.index];
      const imageUrl: unknown = currentItem.src ?? currentItem.href;

      if (typeof imageUrl === 'string' && imageUrl.length > 0) {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
      }
    };

    toolbar.append(externalLinkButton);
  };

  const addCustomDownloadButton = (
    toolbar: HTMLElement,
    instance: ExtendedLightGalleryInstance,
  ): void => {
    const downloadButton = document.createElement('button');

    downloadButton.className = `${lightGalleryClassNames.icon} ${lightGalleryClassNames.customDownloadButton}`;
    downloadButton.innerHTML = downloadIcon;
    toolbar.appendChild(downloadButton);

    downloadButton.onclick = async () => {
      const items = instance.items as GalleryItem[];
      const index = instance.index;
      const currentItem = items[index];
      const attachmentId = currentItem.dataset?.id;
      const fileName = currentItem.download;

      if (attachmentId) {
        await downloadAttachmentRef.current(String(attachmentId), fileName);
      }
    };
  };

  const addCustomZoomButtons = (
    toolbar: HTMLElement,
    instance: ExtendedLightGalleryInstance,
  ): void => {
    const zoomInButton = document.createElement('button');

    zoomInButton.className = `${lightGalleryClassNames.icon} ${lightGalleryClassNames.zoomIn}`;
    zoomInButton.innerHTML = zoomPlusIcon;

    const zoomOutButton = document.createElement('button');

    zoomOutButton.className = `${lightGalleryClassNames.icon} ${lightGalleryClassNames.zoomOut}`;
    zoomOutButton.innerHTML = zoomMinusIcon;

    const zoomPlugin = instance.plugins?.find(
      (plugin): plugin is ZoomPlugin => typeof (plugin as ZoomPlugin).zoomIn === 'function',
    );

    zoomInButton.onclick = (e) => {
      e.preventDefault();

      if (zoomPlugin) {
        zoomPlugin.zoomIn();
      }
    };

    zoomOutButton.onclick = (e) => {
      e.preventDefault();

      if (zoomPlugin) {
        zoomPlugin.resetZoom();
        zoomPlugin.init();
      }
    };

    toolbar.append(zoomInButton);
    toolbar.append(zoomOutButton);
  };

  const scheduleFullImageForSlide = useCallback(
    (instance: ExtendedLightGalleryInstance, slideIndex: number) => {
      void loadFullResolutionImageForSlide(
        instance,
        slideIndex,
        fetchAttachmentFullImageRef.current,
        attachmentsListRef.current,
        loadedFullObjectUrlByAttachmentIdRef.current,
        loadingFullImageAttachmentIdsRef.current,
        objectUrlsRef.current,
        styles['full-image-loading'],
        fullImageFetchAbortRef,
        (appliedSlideIndex) => {
          const current = lightGalleryRef.current;

          if (current && current.index === appliedSlideIndex) {
            updateImageToolbarVisibility(current, appliedSlideIndex);
          }
        },
      );
    },
    [updateImageToolbarVisibility],
  );

  const scheduleFullImageForSlideRef = useRef(scheduleFullImageForSlide);

  const displayedAttachments = attachmentsWithPreview || attachments;
  const isReady = !!attachmentsWithPreview;

  const attachmentContentKey = useMemo(
    () =>
      displayedAttachments
        .map(
          (a) =>
            `${a.id}\u001f${a.thumbnailSrc ?? ''}\u001f${a.hasThumbnail ? 1 : 0}\u001f${a.fileName}\u001f${a.src ?? ''}`,
        )
        .join('\u001e'),
    [displayedAttachments],
  );

  const galleryElementClassName = useMemo(
    () => cx(lightGalleryClassNames.attachmentsList, className),
    [className],
  );

  useEffect(() => {
    downloadAttachmentRef.current = downloadAttachment;
    attachmentsListRef.current = attachmentsWithPreview || attachments;
    fetchAttachmentFullImageRef.current = fetchAttachmentFullImage;
    scheduleFullImageForSlideRef.current = scheduleFullImageForSlide;
  }, [
    downloadAttachment,
    attachments,
    attachmentsWithPreview,
    fetchAttachmentFullImage,
    scheduleFullImageForSlide,
  ]);

  useEffect(() => {
    const el = lgContainerRef.current;

    if (!el) {
      return undefined;
    }

    if (displayedAttachments.length === 0) {
      lightGalleryRef.current?.destroy();
      lightGalleryRef.current = null;

      return undefined;
    }

    const scheduleFromEvent = (slideIndex: number): void => {
      const instance = lightGalleryRef.current;

      if (!instance) {
        return;
      }

      scheduleFullImageForSlideRef.current(instance, slideIndex);
    };

    const onBeforeOpen = (): void => {
      const instance = lightGalleryRef.current;

      if (!instance) {
        return;
      }

      scheduleFromEvent(instance.index);
    };

    const onAfterOpen = (): void => {
      const instance = lightGalleryRef.current;

      if (!instance) {
        return;
      }

      scheduleFromEvent(instance.index);
    };

    const onAfterSlide = (event: Event): void => {
      const detail = (event as CustomEvent<{ index?: number }>).detail;

      if (typeof detail?.index === 'number') {
        scheduleFromEvent(detail.index);
      }
    };

    const onBeforeSlide = (event: Event): void => {
      const detail = (event as CustomEvent<{ index?: number; prevIndex?: number }>).detail;
      const instance = lightGalleryRef.current;

      if (!instance || typeof detail?.index !== 'number') {
        return;
      }

      if (typeof detail.prevIndex === 'number' && detail.prevIndex !== detail.index) {
        clearSlidePendingFullLoad(instance, detail.prevIndex);
      }

      const slideEl = instance.getSlideItem(detail.index)?.get();

      if (
        slideEl &&
        shouldPendingHideThumbForSlide(
          instance,
          detail.index,
          attachmentsListRef.current,
          loadedFullObjectUrlByAttachmentIdRef.current,
        )
      ) {
        slideEl.setAttribute(PENDING_FULL_LOAD_ATTR, '');
      }
    };

    el.addEventListener('lgBeforeOpen', onBeforeOpen);
    el.addEventListener('lgAfterOpen', onAfterOpen);
    el.addEventListener('lgBeforeSlide', onBeforeSlide);
    el.addEventListener('lgAfterSlide', onAfterSlide);

    const instance = lightGallery(el, {
      speed: 500,
      plugins: LIGHT_GALLERY_PLUGINS,
      exThumbImage: 'data-thumb',
      nextHtml: nextIcon,
      prevHtml: prevIcon,
      download: false,
      escKey: true,
      licenseKey: '0000-0000-000-0000',
    });

    lightGalleryRef.current = instance;

    if (instance.outer) {
      setTollbarButtonsVisibility(instance);

      const toolbar = instance.outer.get()?.querySelector(`.${lightGalleryClassNames.toolbar}`);

      if (toolbar instanceof HTMLElement) {
        addCustomCloseButton(toolbar);

        if (!toolbar.querySelector(`.${lightGalleryClassNames.externalLink}`)) {
          addCustomExternalLinkButton(toolbar, instance);
        }

        if (!toolbar.querySelector(`.${lightGalleryClassNames.customDownloadButton}`)) {
          addCustomDownloadButton(toolbar, instance);
        }

        if (!toolbar.querySelector(`.${lightGalleryClassNames.zoomIn}`)) {
          addCustomZoomButtons(toolbar, instance);
        }
      }
    }

    return () => {
      el.removeEventListener('lgBeforeOpen', onBeforeOpen);
      el.removeEventListener('lgAfterOpen', onAfterOpen);
      el.removeEventListener('lgBeforeSlide', onBeforeSlide);
      el.removeEventListener('lgAfterSlide', onAfterSlide);
      lightGalleryRef.current = null;
      instance.destroy();
    };
  }, [attachmentContentKey, displayedAttachments.length, setTollbarButtonsVisibility]);

  return (
    <div>
      <div
        ref={lgContainerRef}
        className={`lg-react-element ${galleryElementClassName}`}
      >
        {displayedAttachments.map(({ id, fileName, fileSize, src, thumbnailSrc, hasThumbnail }: AttachmentWithSlider) => {
          const fileExtension = fileName.split('.').pop()?.toLowerCase();
          const svgFallback = getFallbackIcon(fileExtension);
          const finalThumb = thumbnailSrc || svgFallback;
          const galleryMainSrc =
            hasThumbnail && thumbnailSrc ? thumbnailSrc : src || svgFallback;

          return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              key={id}
              className={cx(lightGalleryClassNames.galleryItem, {
                loading: !isReady,
              })}
              data-src={galleryMainSrc}
              data-thumb={finalThumb}
              download={fileName}
              data-id={String(id)}
            >
              <AttachedFile
                key={id}
                fileName={fileName}
                size={convertBytesToMB(fileSize)}
                textPosition="bottom"
                imageSrc={thumbnailSrc}
                withPreview
                isFullWidth
              />
            </a>
          );
        })}
      </div>
    </div>
  );
};
