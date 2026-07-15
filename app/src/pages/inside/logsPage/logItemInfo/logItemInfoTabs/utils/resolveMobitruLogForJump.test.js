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

import { resolveMobitruLogForJump } from './resolveMobitruLogForJump';

describe('resolveMobitruLogForJump', () => {
  test('should return log info when pagesLocation exists on first page', async () => {
    const logInfo = { id: 10, pagesLocation: [{ 10: 1 }] };
    const fetchFn = jest.fn().mockResolvedValue({
      content: [logInfo],
      page: { totalPages: 1 },
    });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      logId: 10,
    });

    expect(result).toEqual(logInfo);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test('should paginate until log is found', async () => {
    const logInfo = { id: 20, pagesLocation: [{ 20: 2 }] };
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 1, pagesLocation: [{ 1: 1 }] }],
        page: { totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [logInfo],
        page: { totalPages: 2 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      logId: 20,
    });

    expect(result).toEqual(logInfo);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test('should return null when log is not found', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      content: [],
      page: { totalPages: 1 },
    });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      logId: 99,
    });

    expect(result).toBeNull();
  });
});
