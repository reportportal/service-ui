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
      getFileNameFromContentDisposition('attachment; filename="a.txt"; filename*=UTF-8\'\'%E0%A4%A'),
    ).toBe('a.txt');
  });

  test('uses the fallback when the header is missing or has no filename', () => {
    expect(getFileNameFromContentDisposition(undefined, 'attachment_1.png')).toBe(
      'attachment_1.png',
    );
    expect(getFileNameFromContentDisposition('inline', 'attachment_1.png')).toBe('attachment_1.png');
  });
});
