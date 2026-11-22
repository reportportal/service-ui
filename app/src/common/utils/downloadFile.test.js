/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getFileNameFromContentDisposition } from './downloadFile';

jest.mock('common/utils/fetch', () => ({ fetch: jest.fn() }));

describe('getFileNameFromContentDisposition', () => {
  test('reads a quoted filename that ends the header', () => {
    expect(getFileNameFromContentDisposition('attachment; filename="report.pdf"')).toBe(
      'report.pdf',
    );
  });

  test('reads an unquoted filename', () => {
    expect(getFileNameFromContentDisposition('attachment; filename=report.pdf')).toBe('report.pdf');
  });

  test('reads the filename when another parameter follows it', () => {
    expect(
      getFileNameFromContentDisposition(
        'attachment; filename="report.pdf"; filename*=UTF-8\'\'report.pdf',
      ),
    ).toBe('report.pdf');
  });

  test('prefers the encoded filename* parameter and decodes it', () => {
    expect(
      getFileNameFromContentDisposition(
        'attachment; filename="=?UTF-8?Q?=D0=BE=D1=82=D1=87=D1=91=D1=82.txt?="; ' +
          "filename*=UTF-8''%D0%BE%D1%82%D1%87%D1%91%D1%82%20%231.txt",
      ),
    ).toBe('отчёт #1.txt');
  });

  test('falls back to the plain filename when filename* is malformed', () => {
    expect(
      getFileNameFromContentDisposition(
        'attachment; filename="a.txt"; filename*=UTF-8\'\'%E0%A4%A',
      ),
    ).toBe('a.txt');
  });

  test('uses the fallback when the header is missing or has no filename', () => {
    expect(getFileNameFromContentDisposition(undefined, 'attachment_1.png')).toBe(
      'attachment_1.png',
    );
    expect(getFileNameFromContentDisposition('inline', 'attachment_1.png')).toBe(
      'attachment_1.png',
    );
  });

  test('does not match a parameter whose name merely ends with filename', () => {
    expect(
      getFileNameFromContentDisposition(
        'attachment; x-filename="other.txt"; filename="report.pdf"',
      ),
    ).toBe('report.pdf');
  });

  test('keeps a semicolon inside a quoted filename', () => {
    expect(getFileNameFromContentDisposition('attachment; filename="a;b.txt"; size=5')).toBe(
      'a;b.txt',
    );
  });

  test('matches parameter names case-insensitively', () => {
    expect(getFileNameFromContentDisposition('attachment; FILENAME="REPORT.pdf"')).toBe(
      'REPORT.pdf',
    );
  });

  test('reads filename* with a language tag', () => {
    expect(
      getFileNameFromContentDisposition("attachment; filename*=UTF-8'en'na%C3%AFve%20file.txt"),
    ).toBe('naïve file.txt');
  });

  test('decodes filename* declared as ISO-8859-1', () => {
    expect(
      getFileNameFromContentDisposition("attachment; filename*=ISO-8859-1''caf%E9.txt", 'fb.txt'),
    ).toBe('café.txt');
  });

  test('matches the filename* charset case-insensitively', () => {
    expect(
      getFileNameFromContentDisposition("attachment; filename*=utf-8''caf%C3%A9.txt", 'fb.txt'),
    ).toBe('café.txt');
  });

  test('falls back for a malformed ISO-8859-1 filename*', () => {
    expect(
      getFileNameFromContentDisposition("attachment; filename*=iso-8859-1''caf%E.txt", 'fb.txt'),
    ).toBe('fb.txt');
  });

  test('falls back for an unsupported filename* charset', () => {
    expect(
      getFileNameFromContentDisposition("attachment; filename*=koi8-r''%D0%D2.txt", 'fb.txt'),
    ).toBe('fb.txt');
  });
});
