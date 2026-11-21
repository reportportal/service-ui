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

import { getDeleteLaunchesResult, getFinishedLaunchesUpdate } from './utils';

describe('getDeleteLaunchesResult', () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

  test('reports the launches missing from "deleted" as failed', () => {
    const result = getDeleteLaunchesResult(items, {
      deleted: [1],
      notFound: [3],
      errors: [{ errorCode: 4003, message: 'Launch is in progress' }],
    });

    expect(result.failedItems).toEqual([{ id: 2 }, { id: 3 }]);
    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(2);
    expect(result.totalCount).toBe(3);
    expect(result.errorsText).toBe('Launch is in progress');
  });

  test('reports no failures when every launch was deleted', () => {
    const result = getDeleteLaunchesResult(items, { deleted: [1, 2, 3], notFound: [], errors: [] });

    expect(result.failedItems).toEqual([]);
    expect(result.successCount).toBe(3);
  });

  test('treats a response without a body as a full success', () => {
    expect(getDeleteLaunchesResult(items, undefined).failedItems).toEqual([]);
  });
});

describe('getFinishedLaunchesUpdate', () => {
  const launches = [
    { id: 1, status: 'IN_PROGRESS' },
    { id: 2, status: 'IN_PROGRESS' },
  ];

  test('does not touch a launch that was not part of the request', () => {
    const update = getFinishedLaunchesUpdate({
      requestedIds: [1],
      launchesWithStatus: { 1: 'PASSED' },
      launchesInProgress: [1, 2],
      launches,
    });

    expect(update.launchesInProgress).toEqual([2]);
    expect(update.finishedCount).toBe(1);
    expect(update.finishedLaunches).toHaveLength(1);
    expect(update.finishedLaunches[0]).toMatchObject({ id: 1, status: 'PASSED' });
  });

  test('returns nothing when the requested launches are still in progress', () => {
    expect(
      getFinishedLaunchesUpdate({
        requestedIds: [1],
        launchesWithStatus: { 1: 'IN_PROGRESS' },
        launchesInProgress: [1, 2],
        launches,
      }),
    ).toBeNull();
  });
});
