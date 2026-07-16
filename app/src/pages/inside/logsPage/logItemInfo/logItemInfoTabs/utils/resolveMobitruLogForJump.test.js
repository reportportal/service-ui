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
      itemId: 100,
      logId: 10,
    });

    expect(result).toEqual(logInfo);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/log/locations/search/'),
      expect.objectContaining({
        params: expect.objectContaining({ 'filter.eq.level': 'mobitru' }),
      }),
    );
  });

  test('should parse plain array locations response', async () => {
    const logInfo = { id: 10, pagesLocation: [{ 10: 1 }] };
    const fetchFn = jest.fn().mockResolvedValueOnce([logInfo]);

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 100,
      logId: 10,
    });

    expect(result).toEqual(logInfo);
  });

  test('should paginate until log is found in locations', async () => {
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
      itemId: 100,
      logId: 20,
    });

    expect(result).toEqual(logInfo);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test('should fall back to nested grid when locations do not include mobitru log', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        page: { totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 163839, level: 'mobitru' }],
        page: { totalPages: 2 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 100,
      logId: 163839,
      logQuery: { 'page.size': 50, 'page.sort': 'logTime,ASC' },
    });

    expect(result).toEqual({ id: 163839, pagesLocation: [{ 163839: 2 }] });
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });

  test('should resolve nested step mobitru log via nested grid fallback', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        content: [{ id: 200, hasContent: true }],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 300, level: 'mobitru' }],
        page: { totalPages: 1 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 200,
      logId: 300,
    });

    expect(result).toEqual({
      id: 300,
      pagesLocation: [{ 200: 1 }, { 300: 1 }],
    });
  });

  test('should resolve deeply nested mobitru log via recursive nested grid fallback', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        content: [{ id: 200, hasContent: true }],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 200, hasContent: true }],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 300, hasContent: true }],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 400, level: 'mobitru' }],
        page: { totalPages: 1 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 300,
      logId: 400,
    });

    expect(result).toEqual({
      id: 400,
      pagesLocation: [{ 200: 1 }, { 300: 1 }, { 400: 1 }],
    });
  });

  test('should resolve nested log by recursion when itemId is missing', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        content: [{ id: 200, hasContent: true }],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 300, level: 'mobitru' }],
        page: { totalPages: 1 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: undefined,
      logId: 300,
    });

    expect(result).toEqual({
      id: 300,
      pagesLocation: [{ 200: 1 }, { 300: 1 }],
    });
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
      itemId: 100,
      logId: 99,
    });

    expect(result).toBeNull();
  });

  test('should pass log query params and exclude message filter and page', async () => {
    const logInfo = { id: 10, pagesLocation: [{ 10: 1 }] };
    const fetchFn = jest.fn().mockResolvedValue({
      content: [logInfo],
      page: { totalPages: 1 },
    });

    await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 100,
      logId: 10,
      logQuery: {
        'page.size': 50,
        'page.sort': 'logTime,ASC',
        'page.page': 3,
        'filter.cnt.message': 'error text',
        'filter.gte.level': 'error',
      },
    });

    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/log/locations/search/'),
      expect.objectContaining({
        params: expect.objectContaining({
          'page.size': 50,
          'page.sort': 'logTime,ASC',
          'filter.eq.level': 'mobitru',
        }),
      }),
    );
    expect(fetchFn.mock.calls[0][1].params).not.toHaveProperty('filter.cnt.message');
    expect(fetchFn.mock.calls[0][1].params['page.page']).toBe(1);
  });

  test('should propagate locations API errors to caller', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      resolveMobitruLogForJump({
        fetchFn,
        projectKey: 'default_personal',
        retryId: 100,
        itemId: 100,
        logId: 10,
      }),
    ).rejects.toThrow('Network error');
  });

  test('should propagate nested grid API errors to caller', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockRejectedValue(new Error('Nested grid unavailable'));

    await expect(
      resolveMobitruLogForJump({
        fetchFn,
        projectKey: 'default_personal',
        retryId: 100,
        itemId: 100,
        logId: 163839,
      }),
    ).rejects.toThrow('Nested grid unavailable');
  });
});
