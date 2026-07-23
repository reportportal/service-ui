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

import { PAGINATION_OFFSET } from 'controllers/log/nestedSteps/constants';
import { resolveMobitruLogForJump } from './resolveMobitruLogForJump';

describe('resolveMobitruLogForJump', () => {
  test('should fail fast with null when locations search has no hit', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      content: [],
      page: { totalPages: 1, totalElements: 0 },
    });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 100,
      logId: 99,
    });

    expect(result).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringMatching(/\/log\/locations\/search\/\d+$/),
      expect.objectContaining({
        params: expect.objectContaining({
          'filter.eq.logId': 99,
          excludeLogContent: true,
        }),
      }),
    );
  });

  test('should ignore search pagesLocation and resolve via nested grid when log exists', async () => {
    const wrongSearchLocation = {
      id: 10,
      pagesLocation: [{ 10: 1 }],
    };
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [wrongSearchLocation],
        page: { totalPages: 1, totalElements: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        page: { totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 10, level: 'mobitru' }],
        page: { totalPages: 2 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 100,
      logId: 10,
      logQuery: { 'page.size': 10, 'page.sort': 'logTime,ASC' },
    });

    expect(result).toEqual({ id: 10, pagesLocation: [{ 10: 2 }] });
    expect(fetchFn.mock.calls[0][0]).toMatch(/\/log\/locations\/search\/\d+$/);
    expect(fetchFn.mock.calls[0][1].params).toEqual(
      expect.objectContaining({
        'filter.eq.logId': 10,
        'page.size': 10,
        'page.sort': 'logTime,ASC',
      }),
    );
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/log/nested/'),
      expect.objectContaining({
        params: expect.objectContaining({
          'page.size': 10,
          'page.page': 1,
        }),
      }),
    );
    expect(fetchFn.mock.calls[2][1].params['page.size']).toBe(10);
    expect(fetchFn.mock.calls[2][1].params['page.page']).toBe(2);
  });

  test('should use nested step page size matching loadStep pagination offset', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 300, pagesLocation: [{ 200: 1 }, { 300: 1 }] }],
        page: { totalPages: 1, totalElements: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 200, hasContent: true }],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        page: { totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 300, level: 'mobitru' }],
        page: { totalPages: 2 },
      });

    const result = await resolveMobitruLogForJump({
      fetchFn,
      projectKey: 'default_personal',
      retryId: 100,
      itemId: 200,
      logId: 300,
      logQuery: { 'page.size': 10 },
    });

    expect(result).toEqual({
      id: 300,
      pagesLocation: [{ 200: 1 }, { 300: 2 }],
    });
    expect(fetchFn.mock.calls[1][1].params['page.size']).toBe(10);
    expect(fetchFn.mock.calls[2][1].params['page.size']).toBe(PAGINATION_OFFSET);
    expect(fetchFn.mock.calls[3][1].params['page.size']).toBe(PAGINATION_OFFSET);
  });

  test('should resolve nested step mobitru log via nested grid', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 300, pagesLocation: [{ 200: 9 }, { 300: 9 }] }],
        page: { totalPages: 1, totalElements: 1 },
      })
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

  test('should resolve deeply nested mobitru log via recursive nested grid', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 400, pagesLocation: [{ 200: 1 }, { 300: 1 }, { 400: 1 }] }],
        page: { totalPages: 1, totalElements: 1 },
      })
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
    expect(fetchFn.mock.calls[1][1].params['page.size']).toBe(50);
    expect(fetchFn.mock.calls[3][1].params['page.size']).toBe(PAGINATION_OFFSET);
    expect(fetchFn.mock.calls[4][1].params['page.size']).toBe(PAGINATION_OFFSET);
  });

  test('should resolve nested log by recursion when itemId is missing', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 300, pagesLocation: [{ 200: 1 }, { 300: 1 }] }],
        page: { totalPages: 1, totalElements: 1 },
      })
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

  test('should resolve nested log on page two via recursive nested grid', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 300, pagesLocation: [{ 200: 1 }, { 300: 1 }] }],
        page: { totalPages: 1, totalElements: 1 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        page: { totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 200, hasContent: true }],
        page: { totalPages: 2 },
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
      pagesLocation: [{ 200: 2 }, { 300: 1 }],
    });
  });

  test('should omit caller level filters in nested grid resolution', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [{ id: 300, pagesLocation: [{ 200: 1 }, { 300: 1 }] }],
        page: { totalPages: 1, totalElements: 1 },
      })
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
      logQuery: { 'filter.gte.level': 'error', 'page.size': 50 },
    });

    expect(result).toEqual({
      id: 300,
      pagesLocation: [{ 200: 1 }, { 300: 1 }],
    });

    const nestedCalls = fetchFn.mock.calls.filter(([url]) => String(url).includes('/log/nested/'));
    expect(nestedCalls.length).toBeGreaterThan(0);
    nestedCalls.forEach(([, options]) => {
      expect(options.params).not.toHaveProperty('filter.gte.level');
      expect(options.params).not.toHaveProperty('filter.eq.level');
    });
  });

  test('should fall back to locations level variants when nested grid cannot resolve log', async () => {
    const logInfo = { id: 10, pagesLocation: [{ 10: 1 }] };
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        content: [logInfo],
        page: { totalPages: 1, totalElements: 1 },
      })
      .mockResolvedValueOnce({
        content: [],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
        content: [],
        page: { totalPages: 1 },
      })
      .mockResolvedValueOnce({
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
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringMatching(/\/log\/locations\/search\/\d+$/),
      expect.objectContaining({
        params: expect.objectContaining({
          'filter.eq.level': 'mobitru',
          excludeLogContent: true,
        }),
      }),
    );
  });

  test('should fall back to nested grid when locations search request fails', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Search unavailable'))
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

  test('should propagate nested grid API errors when locations search fails', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Search unavailable'))
      .mockRejectedValueOnce(new Error('Nested grid unavailable'));

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

  test('should propagate locations API errors when nested grid misses the log', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Search unavailable'))
      .mockResolvedValueOnce({
        content: [],
        page: { totalPages: 1 },
      })
      .mockRejectedValueOnce(new Error('Network error'));

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
});
