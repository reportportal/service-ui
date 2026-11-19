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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

import {
  COMPARE_ITERATION_PAGE_SIZE,
  resolvePreviousCompareIteration,
} from './compareIterationHistory';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));

const fetchMock = fetch as jest.MockedFunction<(url: string) => Promise<unknown>>;
const projectKey = 'demo';
const pipelineId = 7;
const toIteration = (number: number) => ({
  id: 1000 + number,
  pipelineId,
  iterationNumber: number,
});
const candidate = toIteration(203);

const mockHistory = (getNewestIteration: (pageRead: number) => number) => {
  const offsets: number[] = [];
  fetchMock.mockImplementation((url) => {
    if (url === URLS.pipelineIterationById(projectKey, candidate.id)) {
      return Promise.resolve(candidate);
    }

    const { searchParams } = new URL(url, 'https://example.test');
    const offset = Number(searchParams.get('offset'));
    const size = Number(searchParams.get('limit'));
    offsets.push(offset);

    const newest = getNewestIteration(offsets.length);
    return Promise.resolve({
      content: Array.from({ length: Math.min(size, newest - offset) }, (_, index) =>
        toIteration(newest - offset - index),
      ),
      page: {
        number: offset / size + 1,
        size,
        totalElements: newest,
        totalPages: Math.ceil(newest / size),
      },
    });
  });
  return offsets;
};

const resolveBaseline = () =>
  resolvePreviousCompareIteration(
    { projectKey, pipelineId, signal: new AbortController().signal },
    candidate.id,
  );

describe('resolvePreviousCompareIteration', () => {
  const pageSize = COMPARE_ITERATION_PAGE_SIZE;

  test('finds the closest earlier iteration across stable page boundaries', async () => {
    const offsets = mockHistory(() => 601);

    await expect(resolveBaseline()).resolves.toMatchObject({
      id: toIteration(202).id,
      number: 202,
    });
    expect(offsets).toEqual([0, 2 * pageSize, pageSize]);
  });

  test('restarts when a new iteration shifts a page boundary without changing the page count', async () => {
    const offsets = mockHistory((pageRead) => (pageRead < 3 ? 601 : 602));

    await expect(resolveBaseline()).resolves.toMatchObject({
      id: toIteration(202).id,
      number: 202,
    });
    expect(offsets).toEqual([0, 2 * pageSize, pageSize, 0, 2 * pageSize, pageSize]);
  });

  test('fails without choosing a baseline when the retry also sees shifted pages', async () => {
    const offsets = mockHistory((pageRead) => 600 + pageRead);

    await expect(resolveBaseline()).rejects.toThrow(
      'Iteration history changed during comparison lookup',
    );
    expect(offsets).toEqual([0, 2 * pageSize, 0, 2 * pageSize]);
  });
});
