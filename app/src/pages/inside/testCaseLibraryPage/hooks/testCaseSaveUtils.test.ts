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

import { fetch } from 'common/utils';
import { createNewTags } from './testCaseSaveUtils';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
}));

const fetchMock = fetch as unknown as jest.Mock;

describe('testCaseSaveUtils', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('createNewTags', () => {
    test('reuses an existing tag when its creation is rejected', async () => {
      fetchMock
        .mockRejectedValueOnce({ errorCode: 4091, message: 'exists' })
        .mockResolvedValueOnce({ content: [{ id: 42, key: 'smoke', value: '' }] });

      const result = await createNewTags('demo', [
        { id: 1, key: 'regression', value: '' },
        { id: -5, key: 'smoke', value: '' },
      ]);

      expect(result).toEqual([
        { id: 1, key: 'regression', value: '' },
        { id: 42, key: 'smoke', value: '' },
      ]);
    });

    test('skips a tag that can be neither created nor found', async () => {
      fetchMock.mockRejectedValueOnce({ message: 'boom' }).mockResolvedValueOnce({ content: [] });

      await expect(createNewTags('demo', [{ id: -5, key: 'smoke', value: '' }])).resolves.toEqual(
        [],
      );
    });
  });
});
