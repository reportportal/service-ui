/*
 * Copyright 2019 EPAM Systems
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

import { fetch } from 'common/utils/fetch';
import { fetchFileData, openAttachmentInBrowser } from './sagas';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(),
}));

const mockParams = {
  projectKey: 'test_project',
  id: 'abcd',
};

describe('Attachments Sagas', () => {
  test('fetchFileData resolves data', () => {
    const params = { responseType: 'blob' };
    fetchFileData(mockParams, params);
    expect(fetch).toHaveBeenCalledWith('../api/v1/data/test_project/abcd', params);
  });
});

describe('openAttachmentInBrowser', () => {
  let createObjectURL;
  let revokeObjectURL;
  let openSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    createObjectURL = jest.fn(() => 'blob:attachment');
    revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
    jest.useRealTimers();
  });

  const run = (type) => {
    const saga = openAttachmentInBrowser({ payload: 'abcd' });
    saga.next();
    saga.next('test_project');
    saga.next(new Blob(['content'], { type }));

    return createObjectURL.mock.calls[0][0];
  };

  test.each(['text/html', 'image/svg+xml', 'application/xml', 'application/javascript', ''])(
    'opens a %s attachment as plain text',
    (type) => {
      expect(run(type).type).toBe('text/plain');
    },
  );

  test.each(['image/png', 'application/pdf', 'text/plain', 'video/mp4'])(
    'keeps the inline-safe type %s',
    (type) => {
      expect(run(type).type).toBe(type);
    },
  );

  test('drops content type parameters other than the text charset', () => {
    expect(run('image/png;foo=bar').type).toBe('image/png');
  });

  test('keeps a valid charset of a plain text attachment', () => {
    expect(run('text/plain; charset=Shift_JIS').type).toBe('text/plain;charset=shift_jis');
  });

  test('drops a malformed charset', () => {
    expect(run('text/plain;charset=x"<script>').type).toBe('text/plain');
  });

  test('opens the blob without an opener and keeps its URL valid while the tab is open', () => {
    run('image/png');

    expect(openSpy).toHaveBeenCalledWith('blob:attachment', '_blank', 'noopener,noreferrer');
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  test('revokes only URLs older than the 20 most recently opened attachments', () => {
    for (let i = 0; i < 25; i += 1) {
      createObjectURL.mockReturnValueOnce(`blob:attachment-${i}`);
      const saga = openAttachmentInBrowser({ payload: 'abcd' });
      saga.next();
      saga.next('test_project');
      saga.next(new Blob(['content'], { type: 'image/png' }));
    }

    const revoked = revokeObjectURL.mock.calls.map(([url]) => url);

    expect(revoked).toContain('blob:attachment-0');
    expect(revoked).not.toContain('blob:attachment-24');
    expect(revoked).not.toContain('blob:attachment-5');
  });
});
