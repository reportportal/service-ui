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
  adaptLivePipelineIterationDetail,
  adaptLivePipelineIterations,
  adaptLivePipelineIterationsPage,
  adaptLivePipelines,
  adaptLivePipelinesPage,
  isReducedPipeline,
  isReducedPipelineIteration,
  isRichPipeline,
  isRichPipelineIteration,
} from './liveAdapters';

describe('live pipeline catalog adapters', () => {
  test('preserves complete LP1 page metadata for server pagination', () => {
    const page = adaptLivePipelinesPage({
      content: [{ id: 7, name: 'Test case generation' }],
      page: { number: 2, size: 1, totalElements: 2, totalPages: 2 },
    });
    expect(page.content).toEqual([expect.objectContaining({ id: 7 })]);
    expect(page.page).toEqual({ number: 2, size: 1, totalElements: 2, totalPages: 2 });
  });

  test('rejects incomplete nonfinal LP1 pages', () => {
    expect(() =>
      adaptLivePipelinesPage({
        content: [{ id: 7, name: 'Test case generation' }],
        page: { number: 1, size: 100, totalElements: 101, totalPages: 2 },
      }),
    ).toThrow('Invalid pipeline catalog response');
  });

  test('adapts the backend journey LP1 page without inventing repository or settings fields', () => {
    expect(
      adaptLivePipelines({
        content: [
          {
            id: 7,
            name: 'Test case generation',
            type: 'TEST_CASE_GENERATION',
            attributes: [
              {
                key: 'repository',
                label: 'Repository',
                value: 'EPM-RPP/rp-tests',
                type: 'META',
                valueType: 'LINK',
                url: 'https://gitlab.epam.com/epm-rpp/rp-tests',
              },
            ],
            iterationsCount: 1,
          },
        ],
        page: { number: 1, size: 100, totalElements: 1, totalPages: 1 },
      }),
    ).toEqual([
      {
        kind: 'reduced',
        id: 7,
        name: 'Test case generation',
        type: 'TEST_CASE_GENERATION',
        repository: 'EPM-RPP/rp-tests',
        description: undefined,
        iterationsCount: 1,
        autoReady: undefined,
      },
    ]);
  });

  test('adapts nested Auto-Ready settings from the backend journey LP1 page', () => {
    expect(
      adaptLivePipelines({
        content: [
          {
            id: 7,
            name: 'Test case generation',
            settings: { autoReady: { enabled: true, threshold: 90 } },
          },
        ],
        page: { number: 1, size: 100, totalElements: 1, totalPages: 1 },
      })[0].autoReady,
    ).toEqual({ enabled: true, threshold: 90 });
  });

  test('preserves typed LP2 visual fields and derives trigger from iteration attributes', () => {
    const [iteration] = adaptLivePipelineIterations(
      [
        {
          id: 31,
          pipelineId: 7,
          iterationNumber: 1,
          status: 'In review',
          statusCategory: 'WAITING',
          attributes: [
            { key: 'trigger', label: 'Trigger', value: 'Web form', type: 'META', order: 2 },
            {
              key: 'ci',
              label: 'CI pipeline',
              value: '#1284551',
              type: 'TAG',
              valueType: 'LINK',
              url: 'https://gitlab.epam.com/pipeline/1284551',
            },
          ],
          stages: [
            {
              id: 104,
              name: 'Review',
              sequence: 4,
              status: 'In progress',
              statusCategory: 'WAITING',
              summary: '2/4 Ready',
              message: '2 Draft Test Cases wait for review',
              attributes: [
                { key: 'ready', value: '2', type: 'NONE' },
                { key: 'total', value: '4', type: 'NONE' },
              ],
            },
          ],
        },
      ],
      7,
    );

    expect(iteration.trigger).toBe('Web form');
    expect(iteration.attributes).toContainEqual({
      key: 'trigger',
      label: 'Trigger',
      value: 'Web form',
      type: 'META',
      order: 2,
    });
    expect(iteration.attributes).toContainEqual({
      key: 'ci',
      label: 'CI pipeline',
      value: '#1284551',
      type: 'TAG',
      valueType: 'LINK',
      url: 'https://gitlab.epam.com/pipeline/1284551',
    });
    expect(iteration.stages[0]).toMatchObject({
      summary: '2/4 Ready',
      message: '2 Draft Test Cases wait for review',
      attributes: [
        { key: 'ready', value: '2', type: 'NONE' },
        { key: 'total', value: '4', type: 'NONE' },
      ],
    });
  });

  test('preserves LP3 section tables and score explanations', () => {
    const detail = adaptLivePipelineIterationDetail(
      {
        id: 31,
        pipelineId: 7,
        iterationNumber: 1,
        status: 'In review',
        statusCategory: 'WAITING',
        startedBy: { fullName: 'Anatolii Fedosik' },
        warnings: [{ code: 'RELATED_ENTITY_NOT_FOUND', message: 'Related entities not found' }],
        stages: [
          {
            id: 101,
            name: 'Grade',
            sequence: 2,
            status: 'Passed',
            statusCategory: 'PASSED',
            durationMillis: 151000,
            links: [
              { type: 'RUN', label: '#8812301', url: 'https://gitlab.epam.com/jobs/8812301' },
            ],
            sections: [
              {
                key: 'gradedCases',
                title: 'Graded test cases',
                role: 'RESULT',
                columns: [
                  { key: 'name', label: 'Name' },
                  { key: 'total', label: 'TOTAL /100' },
                ],
                rows: [
                  {
                    key: 'case-1',
                    cells: { name: { value: 'Empty state' }, total: 94 },
                    details: [{ heading: 'Clear steps', items: ['Name the message'] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      7,
      31,
    );

    expect(detail.startedBy).toBe('Anatolii Fedosik');
    expect(detail.warnings).toEqual(['Related entities not found']);
    expect(detail.warningDetails).toEqual([
      {
        code: 'RELATED_ENTITY_NOT_FOUND',
        message: 'Related entities not found',
      },
    ]);
    expect(detail.stages[0].durationMs).toBe(151000);
    expect(detail.stages[0].links).toEqual([
      { type: 'RUN', label: '#8812301', url: 'https://gitlab.epam.com/jobs/8812301' },
    ]);
    expect(detail.stages[0].sections?.[0].rows[0]).toEqual({
      key: 'case-1',
      cells: { name: 'Empty state', total: '94' },
      details: [{ heading: 'Clear steps', items: ['Name the message'] }],
    });
  });

  test('keeps documented LP3 stage facts and safe table targets for the detail view', () => {
    const detail = adaptLivePipelineIterationDetail(
      {
        id: 31,
        pipelineId: 7,
        iterationNumber: 1,
        attributes: [
          { key: 'suiteScore', value: '79', comparisonKey: false, direction: 'HIGHER_BETTER' },
        ],
        stages: [
          {
            id: 101,
            name: 'Create',
            sequence: 1,
            status: 'Passed',
            attempt: 2,
            ownedBy: 'PIPELINE',
            affectsIterationStatus: true,
            retryable: false,
            startedAt: '2026-09-19T10:13:00Z',
            finishedAt: '2026-09-19T10:19:02Z',
            relatedEntities: [{ entityType: 'TEST_CASE', entityId: 'TC101' }],
            sections: [
              {
                key: 'authoredCases',
                title: 'Authored cases',
                role: 'RESULT',
                columns: [{ key: 'libraryId', label: 'Library id', valueType: 'TEXT' }],
                rows: [
                  {
                    key: 'case-1',
                    cells: {
                      libraryId: {
                        value: 'TC101',
                        target: { entityType: 'TEST_CASE', entityId: 'TC101' },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
        warnings: [
          {
            code: 'RELATED_ENTITY_NOT_FOUND',
            message: 'Not linked',
            stageId: 101,
            entityType: 'TEST_CASE',
            entityIds: ['TC404'],
          },
        ],
      },
      7,
      31,
    );

    expect(detail.attributes[0]).toMatchObject({
      comparisonKey: false,
      direction: 'HIGHER_BETTER',
    });
    expect(detail.stages[0]).toMatchObject({
      attempt: 2,
      ownedBy: 'PIPELINE',
      affectsIterationStatus: true,
      retryable: false,
      relatedEntities: [{ entityType: 'TEST_CASE', entityId: 'TC101' }],
    });
    expect(detail.stages[0].sections?.[0].rows[0].cellLinks).toEqual({
      libraryId: { entityType: 'TEST_CASE', entityId: 'TC101' },
    });
    expect(detail.warningDetails?.[0]).toMatchObject({
      code: 'RELATED_ENTITY_NOT_FOUND',
      stageId: 101,
      entityIds: ['TC404'],
    });
  });

  test('fails closed when the backend journey LP1 page is incomplete or malformed', () => {
    const pipeline = { id: 7, name: 'Test case generation' };
    expect(() =>
      adaptLivePipelines({
        content: [pipeline],
        page: { number: 1, size: 100, totalElements: 101, totalPages: 2 },
      }),
    ).toThrow('Invalid pipeline catalog response');
    expect(() =>
      adaptLivePipelines({
        content: [{ ...pipeline, attributes: [{ key: 'repository', value: 7 }] }],
        page: { number: 1, size: 100, totalElements: 1, totalPages: 1 },
      }),
    ).toThrow('Invalid pipeline catalog entity');
    expect(() =>
      adaptLivePipelines({
        content: [pipeline],
        page: { number: 1, size: 100, totalElements: 1, totalPages: 1, hasNext: true },
      }),
    ).toThrow('Invalid pipeline catalog response');
  });

  test('adapts a valid reduced LP1 payload and trims optional values', () => {
    expect(
      adaptLivePipelines([
        {
          id: 7,
          name: '  Release validation  ',
          description: '  Main pipeline  ',
          iterationsCount: 2,
          autoReadyEnabled: true,
          autoReadyThreshold: 85,
        },
      ]),
    ).toEqual([
      {
        kind: 'reduced',
        id: 7,
        name: 'Release validation',
        description: 'Main pipeline',
        iterationsCount: 2,
        autoReady: { enabled: true, threshold: 85 },
      },
    ]);
  });

  test.each([null, {}, 'pipelines', 1])('rejects invalid LP1 top-level data %p', (payload) => {
    expect(() => adaptLivePipelines(payload)).toThrow('Invalid pipeline catalog response');
  });

  test('rejects the complete LP1 payload when any entity is invalid', () => {
    expect(() =>
      adaptLivePipelines([
        { id: 9, name: 'Valid' },
        { id: 0, name: 'Invalid id' },
      ]),
    ).toThrow('Invalid pipeline catalog entity');
  });

  test('rejects duplicate pipeline identities and oversized LP1 collections', () => {
    expect(() =>
      adaptLivePipelines([
        { id: 7, name: 'First' },
        { id: 7, name: 'Duplicate' },
      ]),
    ).toThrow('Duplicate pipeline id');
    expect(() =>
      adaptLivePipelines(
        Array.from({ length: 101 }, (_, index) => ({ id: index + 1, name: `Pipeline ${index}` })),
      ),
    ).toThrow('Invalid pipeline catalog response');
  });

  test.each([
    ['name length', { id: 7, name: 'x'.repeat(256) }],
    ['description length', { id: 7, name: 'Valid', description: 'x'.repeat(2001) }],
    ['iteration count', { id: 7, name: 'Valid', iterationsCount: -1 }],
    ['Auto-Ready flag type', { id: 7, name: 'Valid', autoReadyEnabled: 'true' }],
    ['orphan Auto-Ready threshold', { id: 7, name: 'Valid', autoReadyThreshold: 50 }],
    [
      'Auto-Ready threshold bound',
      { id: 7, name: 'Valid', autoReadyEnabled: true, autoReadyThreshold: 101 },
    ],
  ])('rejects invalid LP1 %s', (_description, pipeline) => {
    expect(() => adaptLivePipelines([pipeline])).toThrow('Invalid pipeline catalog entity');
  });

  test('adapts a valid LP2 payload, sorts safe attributes and stages, and parses timestamps', () => {
    const result = adaptLivePipelineIterations(
      [
        {
          id: 101,
          pipelineId: 7,
          iterationNumber: 3,
          status: 'PASSED',
          trigger: ' CI ',
          startedAt: '2026-10-04T10:00:00.000Z',
          finishedAt: '2026-10-04T10:01:00.000Z',
          durationMillis: 60_000,
          attributes: { zeta: 'last', alpha: 'first' },
          stages: [
            { stageKey: 'review', shortName: 'Review', sequence: 2, status: 'NEEDS_HUMAN' },
            { stageKey: 'prepare', name: 'Prepare', sequence: 1, status: 'PASSED' },
          ],
        },
      ],
      7,
    );

    expect(result).toEqual([
      {
        kind: 'reduced',
        id: 101,
        pipelineId: 7,
        number: 3,
        status: 'PASSED',
        trigger: 'CI',
        startedAt: Date.parse('2026-10-04T10:00:00.000Z'),
        finishedAt: Date.parse('2026-10-04T10:01:00.000Z'),
        durationMs: 60_000,
        attributes: [
          { key: 'alpha', value: 'first' },
          { key: 'zeta', value: 'last' },
        ],
        stages: [
          { key: 'prepare', stageKey: 'prepare', label: 'Prepare', sequence: 1, status: 'PASSED' },
          {
            key: 'review',
            stageKey: 'review',
            label: 'Review',
            sequence: 2,
            status: 'NEEDS_HUMAN',
          },
        ],
      },
    ]);
  });

  test('adapts the observed LP2 page with status categories and stage IDs', () => {
    expect(
      adaptLivePipelineIterations(
        {
          content: [
            {
              id: 1,
              pipelineId: 1,
              iterationNumber: 1,
              status: 'In review',
              statusCategory: 'WAITING',
              attributes: [{ key: 'requirement', value: 'US-TMS-MIG-001' }],
              stages: [
                { id: 10, name: 'Create', sequence: 1, status: 'Passed', statusCategory: 'PASSED' },
                {
                  id: 11,
                  name: 'Review',
                  sequence: 2,
                  status: 'In progress',
                  statusCategory: 'WAITING',
                },
              ],
              startedAt: '2026-09-19T10:13:00Z',
              finishedAt: '2026-09-19T10:22:40Z',
              durationMillis: 580000,
            },
          ],
          page: { number: 1, size: 100, totalElements: 1, totalPages: 1 },
        },
        1,
      ),
    ).toEqual([
      {
        kind: 'reduced',
        id: 1,
        pipelineId: 1,
        number: 1,
        status: 'WAITING',
        statusText: 'In review',
        trigger: undefined,
        startedAt: Date.parse('2026-09-19T10:13:00Z'),
        finishedAt: Date.parse('2026-09-19T10:22:40Z'),
        durationMs: 580000,
        attributes: [{ key: 'requirement', value: 'US-TMS-MIG-001' }],
        stages: [
          { key: 'stage-10', label: 'Create', sequence: 1, status: 'PASSED', statusText: 'Passed' },
          {
            key: 'stage-11',
            label: 'Review',
            sequence: 2,
            status: 'WAITING',
            statusText: 'In progress',
          },
        ],
      },
    ]);
  });

  test('preserves LP2 page metadata and rejects incomplete pages', () => {
    const iteration = { id: 12, pipelineId: 7, iterationNumber: 2, status: 'Passed' };
    expect(
      adaptLivePipelineIterationsPage(
        {
          content: [iteration],
          page: { number: 2, size: 1, totalElements: 2, totalPages: 2 },
        },
        7,
      ),
    ).toEqual({
      content: [expect.objectContaining({ id: 12, pipelineId: 7 })],
      page: { number: 2, size: 1, totalElements: 2, totalPages: 2 },
    });
    expect(() =>
      adaptLivePipelineIterationsPage(
        {
          content: [iteration],
          page: { number: 1, size: 100, totalElements: 101, totalPages: 2 },
        },
        7,
      ),
    ).toThrow('Invalid pipeline iteration list response');
  });

  test('rejects an incomplete or multi-page LP2 response', () => {
    const iteration = { id: 1, pipelineId: 1, iterationNumber: 1 };
    expect(() =>
      adaptLivePipelineIterations(
        { content: [iteration], page: { number: 1, size: 100, totalElements: 101, totalPages: 2 } },
        1,
      ),
    ).toThrow('Invalid pipeline iteration list response');
    expect(() =>
      adaptLivePipelineIterations({ content: [iteration], page: { number: 1 } }, 1),
    ).toThrow('Invalid pipeline iteration list response');
  });

  test.each([null, {}, 'iterations', 1])('rejects invalid LP2 top-level data %p', (payload) => {
    expect(() => adaptLivePipelineIterations(payload, 7)).toThrow(
      'Invalid pipeline iteration list response',
    );
  });

  test('rejects the complete LP2 payload when an entity has another pipeline identity', () => {
    expect(() =>
      adaptLivePipelineIterations(
        [
          { id: 103, pipelineId: 7, iterationNumber: 2, status: 'PASSED' },
          { id: 101, pipelineId: 8, iterationNumber: 1 },
        ],
        7,
      ),
    ).toThrow('Invalid pipeline iteration entity');
  });

  test.each(['NOT_A_STATUS', 'passed', null, undefined])(
    'normalizes unknown iteration and stage status %p safely',
    (status) => {
      const [iteration] = adaptLivePipelineIterations(
        [
          {
            id: 103,
            pipelineId: 7,
            iterationNumber: 2,
            status,
            stages: [{ stageKey: 'custom', status }],
          },
        ],
        7,
      );

      expect(iteration.status).toBe('UNKNOWN');
      expect(iteration.stages).toEqual([
        {
          key: 'custom',
          stageKey: 'custom',
          label: 'custom',
          sequence: undefined,
          status: 'UNKNOWN',
        },
      ]);
    },
  );

  test.each([
    [
      'duplicate keys',
      [
        { stageKey: 'review', name: 'Review' },
        { stageKey: 'review', name: 'Duplicate' },
      ],
    ],
    ['negative sequence', [{ stageKey: 'review', sequence: -1 }]],
    ['oversized key', [{ stageKey: 'x'.repeat(129) }]],
    ['stage bound', Array.from({ length: 101 }, (_, index) => ({ stageKey: `stage-${index}` }))],
  ])('rejects LP2 stages with %s', (_description, stages) => {
    expect(() =>
      adaptLivePipelineIterations([{ id: 103, pipelineId: 7, iterationNumber: 2, stages }], 7),
    ).toThrow('Invalid pipeline iteration entity');
  });

  test('rejects duplicate iteration identities and oversized LP2 collections', () => {
    expect(() =>
      adaptLivePipelineIterations(
        [
          { id: 103, pipelineId: 7, iterationNumber: 1 },
          { id: 103, pipelineId: 7, iterationNumber: 2 },
        ],
        7,
      ),
    ).toThrow('Duplicate pipeline iteration id');
    expect(() =>
      adaptLivePipelineIterations(
        Array.from({ length: 1001 }, (_, index) => ({
          id: index + 1,
          pipelineId: 7,
          iterationNumber: index + 1,
        })),
        7,
      ),
    ).toThrow('Invalid pipeline iteration list response');
  });

  test.each([
    ['trigger length', { trigger: 'x'.repeat(256) }],
    ['duration bound', { durationMillis: -1 }],
    ['timestamp', { startedAt: 'not-a-date' }],
    ['attribute value type', { attributes: { key: 2 } }],
    ['attribute key length', { attributes: { ['x'.repeat(129)]: 'value' } }],
    [
      'attribute bound',
      {
        attributes: Object.fromEntries(
          Array.from({ length: 101 }, (_, index) => [`k${index}`, 'v']),
        ),
      },
    ],
  ])('rejects invalid LP2 %s', (_description, overrides) => {
    expect(() =>
      adaptLivePipelineIterations(
        [{ id: 103, pipelineId: 7, iterationNumber: 2, ...overrides }],
        7,
      ),
    ).toThrow('Invalid pipeline iteration entity');
  });

  test('distinguishes reduced catalog values from existing rich mock values', () => {
    const reducedPipeline = adaptLivePipelines([{ id: 7, name: 'Reduced' }])[0];
    const reducedIteration = adaptLivePipelineIterations(
      [{ id: 101, pipelineId: 7, iterationNumber: 1 }],
      7,
    )[0];
    const richPipeline = { id: 8, name: 'Rich' } as never;
    const richIteration = { id: 201, pipelineId: 8, number: 1 } as never;

    expect(isReducedPipeline(reducedPipeline)).toBe(true);
    expect(isRichPipeline(reducedPipeline)).toBe(false);
    expect(isReducedPipelineIteration(reducedIteration)).toBe(true);
    expect(isRichPipelineIteration(reducedIteration)).toBe(false);
    expect(isReducedPipeline(richPipeline)).toBe(false);
    expect(isRichPipeline(richPipeline)).toBe(true);
    expect(isReducedPipelineIteration(richIteration)).toBe(false);
    expect(isRichPipelineIteration(richIteration)).toBe(true);
  });

  describe('LP3 iteration detail', () => {
    const minimalDetail = {
      id: 103,
      pipelineId: 7,
      iterationNumber: 3,
    };

    test('adapts a valid minimal detail without inventing optional or rich fields', () => {
      expect(adaptLivePipelineIterationDetail(minimalDetail, 7, 103)).toEqual({
        kind: 'reduced',
        id: 103,
        pipelineId: 7,
        number: 3,
        status: 'UNKNOWN',
        trigger: undefined,
        startedAt: undefined,
        finishedAt: undefined,
        durationMs: undefined,
        attributes: [],
        stages: [],
        pipelineName: undefined,
        createdAt: undefined,
        rawResponse: minimalDetail,
      });
    });

    test('keeps opaque fields out of the normalized view while retaining the full response', () => {
      const result = adaptLivePipelineIterationDetail(
        {
          ...minimalDetail,
          pipelineName: '  Release validation  ',
          pipelineType: ' TEST_CASE_GENERATION ',
          status: 'FUTURE_STATUS',
          trigger: ' CI ',
          startedAt: '2026-10-04T10:00:00.000Z',
          finishedAt: '2026-10-04T10:01:00.000Z',
          createdAt: '2026-10-04T09:59:00.000Z',
          durationMillis: 60_000,
          attributes: { zeta: ' last ', alpha: ' first ' },
          metrics: { suiteScore: 99, costTotal: 12 },
          repository: 'must-not-leak',
          stages: [
            {
              id: 12,
              stageKey: 'review',
              shortName: ' Review ',
              sequence: 2,
              status: 'NEEDS_HUMAN',
              attributes: { hidden: 'value' },
              result: { findings: 2 },
              testCaseIds: [1, 2],
              metrics: { cost: 4 },
              ci: { run: 9 },
              lastRetriedAt: '2026-10-04T11:00:00.000Z',
              lastRetriedBy: 'admin',
            },
            {
              id: 11,
              stageKey: 'prepare',
              name: ' Prepare ',
              sequence: 1,
              status: 'PASSED',
            },
          ],
        },
        7,
        103,
      );

      expect(result).toEqual({
        kind: 'reduced',
        id: 103,
        pipelineId: 7,
        number: 3,
        pipelineName: 'Release validation',
        pipelineType: 'TEST_CASE_GENERATION',
        status: 'UNKNOWN',
        trigger: 'CI',
        startedAt: Date.parse('2026-10-04T10:00:00.000Z'),
        finishedAt: Date.parse('2026-10-04T10:01:00.000Z'),
        createdAt: Date.parse('2026-10-04T09:59:00.000Z'),
        durationMs: 60_000,
        attributes: [
          { key: 'alpha', value: 'first' },
          { key: 'zeta', value: 'last' },
        ],
        stages: [
          {
            id: 11,
            key: 'prepare',
            stageKey: 'prepare',
            label: 'Prepare',
            sequence: 1,
            status: 'PASSED',
          },
          {
            id: 12,
            key: 'review',
            stageKey: 'review',
            label: 'Review',
            sequence: 2,
            status: 'NEEDS_HUMAN',
            attributes: [{ key: 'hidden', value: 'value' }],
          },
        ],
        rawResponse: expect.objectContaining({ repository: 'must-not-leak' }),
      });
      expect(result).not.toHaveProperty('metrics');
      expect(result).not.toHaveProperty('repository');
      expect(result.stages[1].attributes).toEqual([{ key: 'hidden', value: 'value' }]);
      expect(result.stages[1]).not.toHaveProperty('result');
      expect(result.stages[1]).not.toHaveProperty('testCaseIds');
      expect(result.stages[1]).not.toHaveProperty('metrics');
      expect(result.stages[1]).not.toHaveProperty('ci');
      expect(result.stages[1]).not.toHaveProperty('lastRetriedAt');
      expect(result.stages[1]).not.toHaveProperty('lastRetriedBy');
    });

    test.each([
      ['non-object response', null, 7, 103],
      ['wrong pipeline identity', { ...minimalDetail, pipelineId: 8 }, 7, 103],
      ['wrong iteration identity', { ...minimalDetail, id: 104 }, 7, 103],
      ['invalid expected pipeline identity', minimalDetail, 0, 103],
      ['invalid expected iteration identity', minimalDetail, 7, -1],
      ['string response identity', { ...minimalDetail, id: '103' }, 7, 103],
      ['invalid iteration number', { ...minimalDetail, iterationNumber: 0 }, 7, 103],
      ['invalid duration type', { ...minimalDetail, durationMillis: '60000' }, 7, 103],
      ['invalid created date', { ...minimalDetail, createdAt: 'not-a-date' }, 7, 103],
      ['invalid started date', { ...minimalDetail, startedAt: 'not-a-date' }, 7, 103],
      ['invalid pipeline name', { ...minimalDetail, pipelineName: 'x'.repeat(256) }, 7, 103],
      ['invalid pipeline type', { ...minimalDetail, pipelineType: '' }, 7, 103],
      ['invalid attribute array', { ...minimalDetail, attributes: [7] }, 7, 103],
      [
        'unsafe attribute key',
        { ...minimalDetail, attributes: JSON.parse('{"constructor":"unsafe"}') },
        7,
        103,
      ],
      ['invalid stage collection type', { ...minimalDetail, stages: {} }, 7, 103],
      [
        'oversized stage collection',
        {
          ...minimalDetail,
          stages: Array.from({ length: 101 }, (_, index) => ({
            id: index + 1,
            stageKey: `stage-${index}`,
            sequence: index,
          })),
        },
        7,
        103,
      ],
    ])('rejects detail with %s', (_description, payload, pipelineId, iterationId) => {
      expect(() => adaptLivePipelineIterationDetail(payload, pipelineId, iterationId)).toThrow();
    });

    test.each([
      ['a missing id', [{ stageKey: 'prepare', sequence: 1 }]],
      ['a missing sequence', [{ id: 1, stageKey: 'prepare' }]],
      ['a negative sequence', [{ id: 1, stageKey: 'prepare', sequence: -1 }]],
      [
        'duplicate ids',
        [
          { id: 1, stageKey: 'prepare', sequence: 1 },
          { id: 1, stageKey: 'review', sequence: 2 },
        ],
      ],
      [
        'duplicate keys',
        [
          { id: 1, stageKey: 'prepare', sequence: 1 },
          { id: 2, stageKey: 'prepare', sequence: 2 },
        ],
      ],
      [
        'duplicate sequences',
        [
          { id: 1, stageKey: 'prepare', sequence: 1 },
          { id: 2, stageKey: 'review', sequence: 1 },
        ],
      ],
    ])('rejects detail stages with %s', (_description, stages) => {
      expect(() => adaptLivePipelineIterationDetail({ ...minimalDetail, stages }, 7, 103)).toThrow(
        'Invalid pipeline iteration detail response',
      );
    });

    test.each(['FUTURE', 'passed', null, undefined])(
      'normalizes future or unsupported detail status %p to UNKNOWN',
      (status) => {
        const detail = adaptLivePipelineIterationDetail(
          {
            ...minimalDetail,
            status,
            stages: [{ id: 1, stageKey: 'future', sequence: 1, status }],
          },
          7,
          103,
        );

        expect(detail.status).toBe('UNKNOWN');
        expect(detail.stages[0].status).toBe('UNKNOWN');
      },
    );
  });
});
