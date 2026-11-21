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

import { createPendingUploads } from './pendingUploads';

describe('createPendingUploads', () => {
  test('deletes a tracked upload when it is removed, and only once', () => {
    const deleteAttachment = jest.fn();
    const pendingUploads = createPendingUploads(deleteAttachment);

    pendingUploads.track('1');
    pendingUploads.discard('1');
    pendingUploads.discard('1');

    expect(deleteAttachment.mock.calls).toEqual([['1']]);
  });

  test('does not delete attachments it did not upload (already saved ones)', () => {
    const deleteAttachment = jest.fn();

    createPendingUploads(deleteAttachment).discard('saved');

    expect(deleteAttachment).not.toHaveBeenCalled();
  });

  test('deletes every pending upload on cancel, including uploads that finish later', () => {
    const deleteAttachment = jest.fn();
    const pendingUploads = createPendingUploads(deleteAttachment);

    pendingUploads.track('1');
    pendingUploads.track('2');
    pendingUploads.discardAll();
    pendingUploads.track('3');

    expect(deleteAttachment.mock.calls).toEqual([['1'], ['2'], ['3']]);
  });
});
