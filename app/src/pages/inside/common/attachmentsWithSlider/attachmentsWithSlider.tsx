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

import { useEffect, useState, useRef, useCallback } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { projectKeySelector } from 'controllers/project';
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
import { createClassnames, fetch, convertBytesToMB } from 'common/utils';
import { URLS } from 'common/urls';

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

export const AttachmentsWithSlider = ({
  attachments,
  className = '',
}: AttachmentWithSliderProps) => {
  const lightGalleryRef = useRef<LightGalleryInstance | null>(null);
  const projectKey = useSelector(projectKeySelector);
  const [attachmentsWithPreview, setAttachmentsWithPreview] = useState<AttachmentWithSlider[] | null>(null);

  const getAttachmentWithThumbnail = useCallback(async (
    attachment: AttachmentWithSlider,
    objectUrls: string[]
  ): Promise<AttachmentWithSlider> => {
    const thumbnailPromise = fetch(
      URLS.attachmentThumbnail(projectKey, attachment.id),
      { responseType: 'blob' },
      true
    );
    const imagePromise = fetch(
      URLS.tmsAttachmentDownload(projectKey, attachment.id),
      { responseType: 'blob' },
      true
    );

    const [thumbnailResult, imageResult] = await Promise.allSettled([thumbnailPromise, imagePromise]);

    let thumbnailSrc: string | undefined;
    let src: string | undefined;

    if (thumbnailResult.status === 'fulfilled') {
      thumbnailSrc = URL.createObjectURL(thumbnailResult.value.data as MediaSource);
      objectUrls.push(thumbnailSrc);
    }

    if (imageResult.status === 'fulfilled') {
      src = URL.createObjectURL(imageResult.value.data as MediaSource);
      objectUrls.push(src);
    }

    return {
      ...attachment,
      ...(thumbnailSrc && { thumbnailSrc }),
      ...(src && { src }),
    };
  }, [projectKey]);

  const getFallbackIcon = (fileExtension: string): string => {
    const FallbackIcon = svgFallbacks[fileExtension as keyof typeof svgFallbacks] || FileOtherIcon;
    const svgFallbackString = renderToStaticMarkup(<FallbackIcon />);

    return svgToBase64(svgFallbackString);
  };

  useEffect(() => {
    let isMounted = true;
    const objectUrls: string[] = [];

    if (!isEmpty(attachments)) {
      const promises = attachments
        .map(async (attachment: AttachmentWithSlider): Promise<AttachmentWithSlider> => {
          if (attachment.hasThumbnail) {
            return getAttachmentWithThumbnail(attachment, objectUrls);
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

    return () => {
      isMounted = false;
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [attachments, getAttachmentWithThumbnail, setAttachmentsWithPreview]);

  const setTollbarButtonsVisibility = (instance: ExtendedLightGalleryInstance): void => {
    const outer = instance.outer as { selector?: HTMLElement } | undefined;
    const zoomInButton = outer?.selector?.querySelector('.lg-zoom-plus');
    const zoomOutButton = outer?.selector?.querySelector('.lg-zoom-minus');
    const externalLinkButton = outer?.selector?.querySelector('.lg-external-link');

    instance.LGel.on('lgBeforeSlide', (event: { detail: { index: number }}): void => {
      const { index } = event.detail;
      const currentItem = instance.galleryItems[index] as { src?: string };
      const isImage = currentItem.src && !currentItem.src.startsWith('data:image/svg+xml');

      externalLinkButton?.classList.toggle('hidden', !isImage);
      zoomInButton?.classList.toggle('hidden', !isImage);
      zoomOutButton?.classList.toggle('hidden', !isImage);
    });
  };

  const onInit = (detail: { instance: ExtendedLightGalleryInstance }): void => {
    const instance = detail.instance;

    lightGalleryRef.current = instance;

    if (!instance?.outer) {
      return;
    }

    setTollbarButtonsVisibility(instance);

    const outer = instance.outer as { selector?: HTMLElement } | undefined;
    const toolbar = outer?.selector?.querySelector('.lg-toolbar');

    if (toolbar) {
      const closeButton = toolbar.querySelector('.lg-close');

      if (closeButton) {
        closeButton.innerHTML = closeIcon;
      }

      if (!toolbar?.querySelector('.lg-external-link')) {
        const externalLinkButton = document.createElement('button');

        externalLinkButton.className = 'lg-icon lg-external-link';
        externalLinkButton.innerHTML = externalLinkIcon;
        externalLinkButton.onclick = () => {
          const currentItem = instance.galleryItems[instance.index];
          const imageUrl = currentItem.src || currentItem.href;

          if (imageUrl) {
            window.open(imageUrl, '_blank', 'noopener,noreferrer');
          }
        };

        toolbar.append(externalLinkButton);
      }

      if (!toolbar.querySelector('.lg-download-custom')) {
        const downloadButton = document.createElement('button');
        downloadButton.className = 'lg-icon lg-download-custom';
        downloadButton.innerHTML = downloadIcon;
        toolbar.appendChild(downloadButton);

        downloadButton.onclick = async () => {
          const items = instance.items as GalleryItem[];
          const index = instance.index;
          const currentItem = items[index];
          const attachmentId = currentItem.dataset?.id;
          const fileName = currentItem.download;

          if (attachmentId) {
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
          }
        };
      }

      if (!toolbar.querySelector('.lg-zoom-plus')) {
        const zoomInButton = document.createElement('button');

        zoomInButton.className = 'lg-icon lg-zoom-plus';
        zoomInButton.innerHTML = zoomPlusIcon;

        const zoomOutButton = document.createElement('button');

        zoomOutButton.className = 'lg-icon lg-zoom-minus';
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
        elementClassNames={cx('attachments-list', className)}
        exThumbImage="data-thumb"
        nextHtml={nextIcon}
        prevHtml={prevIcon}
        download={false}
        escKey
      >
        {displayedAttachments.map(({ id, fileName, fileSize, src, thumbnailSrc }: AttachmentWithSlider) => {
          const fileExtension = fileName.split('.').pop();
          const svgFallback = getFallbackIcon(fileExtension);
          const finalSrc = src || svgFallback;
          const finalThumb = thumbnailSrc || svgFallback;

          return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              key={id}
              className={cx('gallery-item', {
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
