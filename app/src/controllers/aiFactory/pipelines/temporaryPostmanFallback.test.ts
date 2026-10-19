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
  getPostmanDemoDetail,
  getPostmanDemoIterations,
  getPostmanDemoPipelines,
  isEmptySuccessfulPipelineCatalog,
} from './temporaryPostmanFallback';

const emptyPage = {
  content: [],
  page: { number: 1, size: 100, totalElements: 0, totalPages: 0 },
};

describe('temporary Postman fallback', () => {
  test('accepts only a successful, complete empty first catalog page', () => {
    expect(isEmptySuccessfulPipelineCatalog(200, emptyPage)).toBe(true);
    expect(isEmptySuccessfulPipelineCatalog(204, emptyPage)).toBe(false);
    expect(isEmptySuccessfulPipelineCatalog(200, [])).toBe(false);
    expect(isEmptySuccessfulPipelineCatalog(200, { ...emptyPage, content: [{}] })).toBe(false);
    expect(
      isEmptySuccessfulPipelineCatalog(200, {
        ...emptyPage,
        page: { ...emptyPage.page, totalElements: 1 },
      }),
    ).toBe(false);
    expect(
      isEmptySuccessfulPipelineCatalog(200, {
        ...emptyPage,
        page: { ...emptyPage.page, number: 2 },
      }),
    ).toBe(false);
  });

  test('keeps the synthetic catalog, iteration and detail identities aligned', () => {
    const [pipeline] = getPostmanDemoPipelines();
    const [iteration] = getPostmanDemoIterations(pipeline.id);
    const detail = getPostmanDemoDetail(pipeline.id, iteration.id);

    expect(pipeline).toMatchObject({ name: 'Test case generation', iterationsCount: 1 });
    expect(iteration).toMatchObject({ pipelineId: pipeline.id, status: 'NEEDS_HUMAN' });
    expect(detail).toMatchObject({ id: iteration.id, pipelineId: pipeline.id });
    expect(detail.attributes).toContainEqual({ key: 'suiteScore', value: '79' });
    expect(detail.stages.map(({ key }) => key)).toEqual(['create', 'grade', 'upload', 'review']);
    expect(getPostmanDemoIterations(999)).toEqual([]);
    expect(() => getPostmanDemoDetail(pipeline.id, 999)).toThrow();
  });
});
