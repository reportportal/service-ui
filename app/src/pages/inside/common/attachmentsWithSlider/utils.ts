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

import { createElement, type MutableRefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BubblesLoader } from '@reportportal/ui-kit';

import type { AttachmentWithSlider, ExtendedLightGalleryInstance } from './types';

export const PENDING_FULL_LOAD_ATTR = 'data-rp-pending-full-load';

const IMAGE_FILE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'svg',
  'ico',
  'tif',
  'tiff',
  'heic',
  'heif',
]);
const TRY_SHOW_OVERLAY_MAX_FRAMES = 60;
const fullImageOverlayRoots = new WeakMap<HTMLElement, Root>();

export const isImageAttachmentForGallery = (attachment: AttachmentWithSlider): boolean => {
  const mime = attachment.fileType?.toLowerCase();

  if (mime?.startsWith('image/')) {
    return true;
  }

  const ext = attachment.fileName.split('.').pop()?.toLowerCase();

  return ext ? IMAGE_FILE_EXTENSIONS.has(ext) : false;
};

export const resolveAttachmentForSlide = (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
  attachments: AttachmentWithSlider[],
): { attachmentId: number; attachment: AttachmentWithSlider } | undefined => {
  const domItems = instance.items as HTMLCollection | HTMLElement[] | undefined;
  const anchor = domItems?.[slideIndex] as HTMLElement | undefined;
  const rawId = anchor?.dataset?.id ?? anchor?.getAttribute('data-id') ?? undefined;

  if (rawId !== undefined && rawId !== '') {
    const attachmentId = Number(rawId);
    const attachment = attachments.find((a) => a.id === attachmentId);

    if (attachment && !Number.isNaN(attachmentId)) {
      return { attachmentId, attachment };
    }
  }

  const byOrder = attachments[slideIndex];

  if (byOrder) {
    return { attachmentId: byOrder.id, attachment: byOrder };
  }

  return undefined;
};

export const clearSlidePendingFullLoad = (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
): void => {
  const slideEl = instance.getSlideItem(slideIndex)?.get();

  slideEl?.removeAttribute(PENDING_FULL_LOAD_ATTR);
};

export const shouldPendingHideThumbForSlide = (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
  attachments: AttachmentWithSlider[],
  loadedObjectUrlByAttachmentId: Map<number, string>,
): boolean => {
  const resolved = resolveAttachmentForSlide(instance, slideIndex, attachments);

  if (!resolved) {
    return false;
  }

  const { attachmentId, attachment } = resolved;
  const needsFull = attachment.hasThumbnail === true || Boolean(attachment.thumbnailSrc);

  if (!needsFull) {
    return false;
  }

  return !loadedObjectUrlByAttachmentId.has(attachmentId);
};

export const shouldShowZoomAndExternalLink = (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
  attachments: AttachmentWithSlider[],
  loadedObjectUrlByAttachmentId: Map<number, string>,
): boolean => {
  const resolved = resolveAttachmentForSlide(instance, slideIndex, attachments);

  if (!resolved) {
    return false;
  }

  const { attachmentId, attachment } = resolved;

  if (!isImageAttachmentForGallery(attachment)) {
    return false;
  }

  const needsFullResolution = attachment.hasThumbnail === true || Boolean(attachment.thumbnailSrc);

  if (needsFullResolution && !loadedObjectUrlByAttachmentId.has(attachmentId)) {
    return false;
  }

  const currentItem = instance.galleryItems[slideIndex] as { src?: string };
  const src = currentItem?.src;

  return !(!src || src.startsWith('data:image/svg+xml'));
};

const removeFullImageLoadingOverlays = (
  instance: ExtendedLightGalleryInstance,
  overlayClassName: string,
): void => {
  instance.outer?.get()?.querySelectorAll(`.${overlayClassName}`).forEach((node) => {
    const el = node as HTMLElement;
    const root = fullImageOverlayRoots.get(el);

    if (root) {
      root.unmount();
      fullImageOverlayRoots.delete(el);
    }

    el.remove();
  });
};

const showFullImageLoadingOverlay = (
  instance: ExtendedLightGalleryInstance,
  overlayClassName: string,
  slideHost: HTMLElement,
): void => {
  removeFullImageLoadingOverlays(instance, overlayClassName);

  const overlay = document.createElement('div');

  overlay.className = overlayClassName;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-busy', 'true');
  overlay.setAttribute('data-rp-full-image-loading', 'true');
  slideHost.appendChild(overlay);

  const root = createRoot(overlay);

  fullImageOverlayRoots.set(overlay, root);
  root.render(createElement(BubblesLoader, { variant: 'large' }));
};

const delayOneFrame = (): Promise<void> =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const tryShowFullImageLoadingOverlay = async (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
  overlayClassName: string,
): Promise<void> => {
  const attempt = async (frame: number): Promise<void> => {
    if (frame >= TRY_SHOW_OVERLAY_MAX_FRAMES) {
      return;
    }

    const slideHost = instance.getSlideItem(slideIndex)?.get();

    if (slideHost) {
      showFullImageLoadingOverlay(instance, overlayClassName, slideHost);

      return;
    }

    await delayOneFrame();
    await attempt(frame + 1);
  };

  await attempt(0);
};

export const applyFullResolutionToSlide = (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
  objectUrl: string,
): void => {
  const galleryItem = instance.galleryItems[slideIndex];

  if (galleryItem) {
    galleryItem.src = objectUrl;
  }

  const slide = instance.getSlideItem(slideIndex)?.get();
  const imageEl = slide?.querySelector('img.lg-image');

  if (imageEl instanceof HTMLImageElement) {
    imageEl.src = objectUrl;
    imageEl.style.removeProperty('opacity');
    imageEl.style.removeProperty('visibility');
  }
};

export const loadFullResolutionImageForSlide = async (
  instance: ExtendedLightGalleryInstance,
  slideIndex: number,
  fetchFull: (attachmentId: number, signal: AbortSignal) => Promise<string | undefined>,
  attachments: AttachmentWithSlider[],
  loadedObjectUrlByAttachmentId: Map<number, string>,
  loadingAttachmentIds: Set<number>,
  objectUrlsForRevoke: string[],
  overlayClassName: string,
  fullImageAbortRef: MutableRefObject<AbortController | null>,
  onAfterFullImageApplied?: (slideIndex: number) => void,
): Promise<void> => {
  const resolved = resolveAttachmentForSlide(instance, slideIndex, attachments);

  if (!resolved) {
    return;
  }

  const { attachmentId, attachment } = resolved;

  const shouldFetchFullImage = attachment.hasThumbnail === true || Boolean(attachment.thumbnailSrc);

  if (!shouldFetchFullImage) {
    return;
  }

  const cachedObjectUrl = loadedObjectUrlByAttachmentId.get(attachmentId);

  if (cachedObjectUrl !== undefined) {
    clearSlidePendingFullLoad(instance, slideIndex);
    applyFullResolutionToSlide(instance, slideIndex, cachedObjectUrl);
    onAfterFullImageApplied?.(slideIndex);

    return;
  }

  if (loadingAttachmentIds.has(attachmentId)) {
    return;
  }

  loadingAttachmentIds.add(attachmentId);

  fullImageAbortRef.current?.abort();
  const abortController = new AbortController();

  fullImageAbortRef.current = abortController;

  try {
    await tryShowFullImageLoadingOverlay(instance, slideIndex, overlayClassName);

    const objectUrl = await fetchFull(attachmentId, abortController.signal);

    if (abortController.signal.aborted) {
      return;
    }

    if (objectUrl) {
      objectUrlsForRevoke.push(objectUrl);
      loadedObjectUrlByAttachmentId.set(attachmentId, objectUrl);
      applyFullResolutionToSlide(instance, slideIndex, objectUrl);
      onAfterFullImageApplied?.(slideIndex);
    }
  } finally {
    loadingAttachmentIds.delete(attachmentId);
    removeFullImageLoadingOverlays(instance, overlayClassName);
    clearSlidePendingFullLoad(instance, slideIndex);
  }
};
