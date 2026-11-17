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

import {
  checkMobitruLogTabVisibility,
  isMobitruVideoSubtreeTab,
  MOBITRU_VIDEO_SUBTREE_VISIBILITY_MODE,
} from './checkMobitruLogTabVisibility';

describe('isMobitruVideoSubtreeTab', () => {
  test('should return true when visibilityMode is mobitruVideoSubtree', () => {
    expect(
      isMobitruVideoSubtreeTab({
        payload: { visibilityMode: MOBITRU_VIDEO_SUBTREE_VISIBILITY_MODE },
      }),
    ).toBe(true);
  });

  test('should return false for legacy remote_device tab without visibilityMode', () => {
    expect(
      isMobitruVideoSubtreeTab({
        payload: { tabElementName: 'remote_device', visibilityAttributeKey: 'MBID' },
      }),
    ).toBe(false);
  });
});

describe('checkMobitruLogTabVisibility', () => {
  test('should return true when mobitru video logs exist in subtree', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ content: [{ id: 1 }] });

    const result = await checkMobitruLogTabVisibility({
      fetchFn,
      projectKey: 'default_personal',
      activeRetryPath: '1.2.3',
      excludedRetryParentId: 10,
    });

    expect(result).toBe(true);
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining('default_personal/log'), {
      params: {
        'filter.eq.level': 'mobitru',
        'filter.ex.binaryContent': true,
        'page.size': 1,
        'page.page': 1,
      },
    });
  });

  test('should return false when no mobitru video logs exist in subtree', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ content: [] });

    const result = await checkMobitruLogTabVisibility({
      fetchFn,
      projectKey: 'default_personal',
      activeRetryPath: '1.2.3',
    });

    expect(result).toBe(false);
  });
});
