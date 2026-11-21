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

// Images that are mounted again and again (rows of virtualised lists) are kept as blobs, so that
// they are not requested again. The least recently used ones are dropped first.
export const MAX_CACHED_IMAGES = 300;
export const MAX_CACHED_IMAGES_BYTES = 30 * 1024 * 1024;

const cache = new Map<string, Blob>();
let cachedBytes = 0;

export const getCachedImage = (key: string): Blob | undefined => {
  const blob = cache.get(key);
  if (blob) {
    cache.delete(key);
    cache.set(key, blob);
  }
  return blob;
};

export const cacheImage = (key: string, blob: Blob): void => {
  const previous = cache.get(key);
  if (previous) {
    cache.delete(key);
    cachedBytes -= previous.size;
  }
  if (blob.size > MAX_CACHED_IMAGES_BYTES) {
    return;
  }
  cache.set(key, blob);
  cachedBytes += blob.size;

  while (cache.size > MAX_CACHED_IMAGES || cachedBytes > MAX_CACHED_IMAGES_BYTES) {
    const [oldestKey, oldestBlob] = cache.entries().next().value as [string, Blob];
    cache.delete(oldestKey);
    cachedBytes -= oldestBlob.size;
  }
};

export const clearImageCache = (): void => {
  cache.clear();
  cachedBytes = 0;
};
