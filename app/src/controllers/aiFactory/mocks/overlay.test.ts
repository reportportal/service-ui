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

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { TestCase } from 'types/testCase';
import { resetMockDb } from './db';
import { installOverlayInterceptor, mergeAiFields } from './overlay';

const realTestCase = (displayId: string): TestCase => ({
  id: 555,
  displayId,
  name: 'A real Library case',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  path: ['Some folder'],
  testFolder: { id: 1 },
});

beforeEach(() => resetMockDb());

describe('mergeAiFields', () => {
  test('leaves a case untouched when no mock record matches its displayId', () => {
    const real = realTestCase('TC999-not-seeded');
    expect(mergeAiFields(real)).toEqual(real);
  });

  test('merges lifecycle, AI marker and evaluation onto a matching real case (TC106)', () => {
    const real = realTestCase('TC106');
    const merged = mergeAiFields(real);
    expect(merged).toMatchObject({
      id: 555, // the real numeric id is kept — only AI fields are added
      displayId: 'TC106',
      lifecycle: 'DRAFT',
      ai: { modifiedByAgent: false },
      evaluationSummary: { totalScore: 81, state: 'EVALUATED' },
      review: { unsentCommentsCount: 1 },
    });
  });

  test('a Ready case merges with no blockedPlans', () => {
    const merged = mergeAiFields(realTestCase('TC101'));
    expect(merged.lifecycle).toBe('READY');
    expect(merged.blockedPlans).toEqual([]);
  });
});

describe('installOverlayInterceptor', () => {
  test('enriches a test-case details response', async () => {
    const http = axios.create();
    const mock = new MockAdapter(http);
    installOverlayInterceptor(http);
    mock.onGet('/api/v1/project/demo/tms/test-case/555').reply(200, realTestCase('TC106'));

    const { data } = await http.get<TestCase & { lifecycle?: string }>('/api/v1/project/demo/tms/test-case/555');
    expect(data.lifecycle).toBe('DRAFT');

    mock.restore();
  });

  test('enriches every item of a test-case list response', async () => {
    const http = axios.create();
    const mock = new MockAdapter(http);
    installOverlayInterceptor(http);
    mock.onGet('/api/v1/project/demo/tms/test-case').reply(200, { content: [realTestCase('TC101'), realTestCase('TC106')] });

    const { data } = await http.get<{ content: (TestCase & { lifecycle?: string })[] }>('/api/v1/project/demo/tms/test-case');
    expect(data.content.map((c) => c.lifecycle)).toEqual(['READY', 'DRAFT']);

    mock.restore();
  });

  test('leaves unrelated endpoints alone', async () => {
    const http = axios.create();
    const mock = new MockAdapter(http);
    installOverlayInterceptor(http);
    mock.onGet('/api/v1/project/demo/tms/milestone').reply(200, { content: [] });

    const { data } = await http.get('/api/v1/project/demo/tms/milestone');
    expect(data).toEqual({ content: [] });

    mock.restore();
  });
});
