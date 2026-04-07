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

import LG from 'lightgallery';

export interface AttachmentWithSlider {
  fileName: string;
  fileSize: number;
  id: number;
  fileType: string;
  src?: string;
  hasThumbnail?: boolean;
  thumbnailSrc?: string;
}

export interface LightGalleryEvent {
  detail: {
    index: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type LightGalleryInstance = ReturnType<typeof LG>;

export type GalleryItem = {
  dataset?: DOMStringMap;
  download?: string;
};

export type ZoomPlugin = { zoomIn?: () => void; resetZoom?: () => void; init?: () => void };

export type ExtendedLightGalleryInstance = LightGalleryInstance & {
  outer: { selector?: HTMLElement };
  LGel: { on: (event: string, cb: (event: LightGalleryEvent) => void) => void };
  galleryItems: Array<{ src?: string; href?: string }>;
  items: Array<{ dataset?: DOMStringMap; download?: string }>;
  index: number;
  plugins?: Array<{ zoomIn?: () => void; resetZoom?: () => void; init?: () => void }>;
};
