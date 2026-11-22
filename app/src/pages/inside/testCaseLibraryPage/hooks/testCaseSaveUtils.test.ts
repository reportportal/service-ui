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
import { createNewTags, saveTestCaseWithRequirementRetry } from './testCaseSaveUtils';

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

  describe('saveTestCaseWithRequirementRetry', () => {
    const conflict = { errorCode: 4091, message: 'Requirement already exists' };
    const data = {
      name: 'Case',
      manualScenario: {
        requirements: [
          { id: 'stored', value: 'A' },
          { id: '_new', value: 'B' },
        ],
      },
    };

    test('regenerates ids of not yet stored requirements and retries once on 409', async () => {
      fetchMock
        .mockRejectedValueOnce(conflict)
        .mockResolvedValueOnce({ manualScenario: { requirements: [{ id: 'stored', value: 'A' }] } })
        .mockResolvedValueOnce({ id: 7 });

      const response = await saveTestCaseWithRequirementRetry({
        url: '/test-case/7',
        method: 'PUT',
        data,
        projectKey: 'demo',
        testCaseId: 7,
      });

      expect(response).toEqual({ id: 7 });
      const [, retryParams] = fetchMock.mock.calls[2] as [
        string,
        { data: typeof data; method: string },
      ];
      const [stored, regenerated] = retryParams.data.manualScenario.requirements;
      expect(stored).toEqual({ id: 'stored', value: 'A' });
      expect(regenerated.value).toBe('B');
      expect(regenerated.id).not.toBe('_new');
    });

    test('rethrows other errors without retrying', async () => {
      fetchMock.mockRejectedValueOnce({ errorCode: 4001, message: 'bad' });

      await expect(
        saveTestCaseWithRequirementRetry({ url: '/x', method: 'POST', data, projectKey: 'demo' }),
      ).rejects.toEqual({ errorCode: 4001, message: 'bad' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
