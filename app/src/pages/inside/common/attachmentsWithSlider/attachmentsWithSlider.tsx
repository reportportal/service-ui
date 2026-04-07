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

import { useEffect, useState, useRef, useCallback, MutableRefObject } from 'react';
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
import LightGallery from 'lightgallery/react';
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
  LightGalleryInstance,
  GalleryItem,
  ZoomPlugin,
  ExtendedLightGalleryInstance,
} from './types';
import { useAttachmentsWithSlider } from './hooks';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
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

const lightGalleryClassNames = {
  zoomIn: 'lg-zoom-plus',
  zoomOut: 'lg-zoom-minus',
  externalLink: 'lg-external-link',
  toolbar: 'lg-toolbar',
  closeButton: 'lg-close',
  customDownloadButton: 'lg-download-custom',
  attachmentsList: 'attachments-list',
  galleryItem: 'gallery-item',
  icon: 'lg-icon',
} as const;

export const AttachmentsWithSlider = ({
  attachments,
  className = '',
}: AttachmentWithSliderProps) => {
  const { getAttachmentWithThumbnail, downloadAttachment } = useAttachmentsWithSlider();
  const lightGalleryRef = useRef<LightGalleryInstance | null>(null);
  const isCleanedUpRef = useRef(false);
  const [attachmentsWithPreview, setAttachmentsWithPreview] = useState<AttachmentWithSlider[] | null>(null);

  const getFallbackIcon = (fileExtension: string): string => {
    const FallbackIcon = svgFallbacks[fileExtension as keyof typeof svgFallbacks] || FileOtherIcon;
    const svgFallbackString = renderToStaticMarkup(<FallbackIcon />);

    return svgToBase64(svgFallbackString);
  };

  const addSrcAttributesToAttachments = useCallback((
    objectUrls: string[],
    isMounted: boolean,
    abortSignal: AbortSignal,
    isCleanedUpRef: MutableRefObject<boolean>,
  ): void => {
    setAttachmentsWithPreview(null);

    if (!isEmpty(attachments)) {
      const promises = attachments
        .map(async (attachment: AttachmentWithSlider): Promise<AttachmentWithSlider> => {
          if (attachment.hasThumbnail) {
            return getAttachmentWithThumbnail(attachment, objectUrls,abortSignal, isCleanedUpRef);
          } else {
            return { ...attachment };
          }
        });

      void Promise.all(promises)
        .then((newList) => {
          if (isMounted) {
            setAttachmentsWithPreview(newList);
          }
        });
    }
  }, [attachments, getAttachmentWithThumbnail, setAttachmentsWithPreview]);

  useEffect(() => {
    let isMounted = true;
    const objectUrls: string[] = [];
    const abortController = new AbortController();

    isCleanedUpRef.current = false;
    addSrcAttributesToAttachments(objectUrls, isMounted, abortController.signal, isCleanedUpRef);

    return () => {
      isMounted = false;
      isCleanedUpRef.current = true;
      abortController.abort();
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [addSrcAttributesToAttachments]);

  const setTollbarButtonsVisibility = (instance: ExtendedLightGalleryInstance): void => {
    const outer = instance.outer as { selector?: HTMLElement } | undefined;
    const zoomInButton = outer?.selector?.querySelector(`.${lightGalleryClassNames.zoomIn}`);
    const zoomOutButton = outer?.selector?.querySelector(`.${lightGalleryClassNames.zoomOut}`);
    const externalLinkButton = outer?.selector?.querySelector(`.${lightGalleryClassNames.externalLink}`);

    instance.LGel.on('lgBeforeSlide', (event: { detail: { index: number }}): void => {
      const { index } = event.detail;
      const currentItem = instance.galleryItems[index] as { src?: string };
      const isImage = currentItem.src && !currentItem.src.startsWith('data:image/svg+xml');

      externalLinkButton?.classList.toggle('hidden', !isImage);
      zoomInButton?.classList.toggle('hidden', !isImage);
      zoomOutButton?.classList.toggle('hidden', !isImage);
    });
  };

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
      const imageUrl = currentItem.src || currentItem.href;

      if (imageUrl) {
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
        await downloadAttachment(attachmentId, fileName);
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
      (plugin): plugin is ZoomPlugin => typeof (plugin as ZoomPlugin).zoomIn === 'function'
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

  const onInit = (detail: { instance: ExtendedLightGalleryInstance }): void => {
    const instance = detail.instance;

    lightGalleryRef.current = instance;

    if (!instance?.outer) {
      return;
    }

    setTollbarButtonsVisibility(instance);

    const outer = instance.outer as { selector?: HTMLElement } | undefined;
    const toolbar = outer?.selector?.querySelector(`.${lightGalleryClassNames.toolbar}`);

    if (toolbar) {
      addCustomCloseButton(toolbar);

      if (!toolbar?.querySelector(`.${lightGalleryClassNames.externalLink}`)) {
        addCustomExternalLinkButton(toolbar, instance);
      }

      if (!toolbar.querySelector(`.${lightGalleryClassNames.customDownloadButton}`)) {
        addCustomDownloadButton(toolbar, instance);
      }

      if (!toolbar.querySelector(`.${lightGalleryClassNames.zoomIn}`)) {
        addCustomZoomButtons(toolbar, instance);
      }
    }
  };

  const displayedAttachments = attachmentsWithPreview || attachments;
  const isReady = !!attachmentsWithPreview;

  return (
    <div>
      <LightGallery
        onInit={onInit}
        speed={500}
        plugins={[lgThumbnail, lgZoom]}
        elementClassNames={cx(lightGalleryClassNames.attachmentsList, className)}
        exThumbImage="data-thumb"
        nextHtml={nextIcon}
        prevHtml={prevIcon}
        download={false}
        escKey
      >
        {displayedAttachments.map(({ id, fileName, fileSize, src, thumbnailSrc }: AttachmentWithSlider) => {
          const fileExtension = fileName.split('.').pop()?.toLowerCase();
          const svgFallback = getFallbackIcon(fileExtension);
          const finalSrc = src || svgFallback;
          const finalThumb = thumbnailSrc || svgFallback;

          return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              key={id}
              className={cx(lightGalleryClassNames.galleryItem, {
                'loading': !isReady,
              })}
              data-src={finalSrc}
              data-thumb={finalThumb}
              download={fileName}
              data-id={id}
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
      </LightGallery>
    </div>
  );
};
