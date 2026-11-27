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

import { withThumbnailFlag } from './utils';

const attachment = (fileType: string, hasThumbnail?: boolean) => ({
  id: 1,
  fileName: 'file',
  fileSize: 10,
  fileType,
  ...(hasThumbnail === undefined ? {} : { hasThumbnail }),
});

describe('withThumbnailFlag', () => {
  test('keeps the flag sent by the server', () => {
    expect(withThumbnailFlag(attachment('image/png', false)).hasThumbnail).toBe(false);
    expect(withThumbnailFlag(attachment('application/pdf', true)).hasThumbnail).toBe(true);
  });

  test('marks PNG and JPEG files without the flag as having a thumbnail', () => {
    expect(withThumbnailFlag(attachment('image/png')).hasThumbnail).toBe(true);
    expect(withThumbnailFlag(attachment('image/jpeg')).hasThumbnail).toBe(true);
  });

  test('marks other files without the flag as having no thumbnail', () => {
    expect(withThumbnailFlag(attachment('image/gif')).hasThumbnail).toBe(false);
    expect(withThumbnailFlag(attachment('image/svg+xml')).hasThumbnail).toBe(false);
    expect(withThumbnailFlag(attachment('image/webp')).hasThumbnail).toBe(false);
    expect(withThumbnailFlag(attachment('application/pdf')).hasThumbnail).toBe(false);
    expect(withThumbnailFlag(attachment('text/plain')).hasThumbnail).toBe(false);
    expect(withThumbnailFlag({ ...attachment(''), fileType: undefined }).hasThumbnail).toBe(false);
  });
});
