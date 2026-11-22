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
  cacheImage,
  clearImageCache,
  getCachedImage,
  MAX_CACHED_IMAGES,
  MAX_CACHED_IMAGES_BYTES,
} from './imageBlobCache';

const blob = (size = 1): Blob => new Blob([new Uint8Array(size)]);

describe('imageBlobCache', () => {
  beforeEach(() => {
    clearImageCache();
  });

  it('returns the cached blob of a key', () => {
    const image = blob();
    cacheImage('a', image);

    expect(getCachedImage('a')).toBe(image);
    expect(getCachedImage('b')).toBeUndefined();
  });

  it('drops the least recently used image above the maximal count', () => {
    Array.from({ length: MAX_CACHED_IMAGES }, (_, i) => cacheImage(`${i}`, blob()));
    getCachedImage('0');

    cacheImage('new', blob());

    expect(getCachedImage('0')).toBeDefined();
    expect(getCachedImage('1')).toBeUndefined();
    expect(getCachedImage('new')).toBeDefined();
  });

  it('drops the least recently used images above the maximal size', () => {
    const half = MAX_CACHED_IMAGES_BYTES / 2;
    cacheImage('a', blob(half));
    cacheImage('b', blob(half));

    cacheImage('c', blob(1));

    expect(getCachedImage('a')).toBeUndefined();
    expect(getCachedImage('b')).toBeDefined();
    expect(getCachedImage('c')).toBeDefined();
  });

  it('does not keep an image larger than the whole cache', () => {
    cacheImage('huge', blob(MAX_CACHED_IMAGES_BYTES + 1));

    expect(getCachedImage('huge')).toBeUndefined();
  });

  it('replaces the image of a key', () => {
    const image = blob();
    cacheImage('a', blob(MAX_CACHED_IMAGES_BYTES / 2));
    cacheImage('a', image);
    cacheImage('b', blob(MAX_CACHED_IMAGES_BYTES / 2));

    expect(getCachedImage('a')).toBe(image);
  });
});
