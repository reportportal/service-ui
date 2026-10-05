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
  adaptLivePipelines,
  isReducedPipeline,
  isReducedPipelineIteration,
  isRichPipeline,
  isRichPipelineIteration,
} from './liveAdapters';

describe('live pipeline catalog adapters', () => {
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
          { key: 'prepare', label: 'Prepare', sequence: 1, status: 'PASSED' },
          { key: 'review', label: 'Review', sequence: 2, status: 'NEEDS_HUMAN' },
        ],
      },
    ]);
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
        { key: 'custom', label: 'custom', sequence: undefined, status: 'UNKNOWN' },
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
      });
    });

    test('adapts safe full detail, sorts stages and attributes, and excludes opaque rich fields', () => {
      const result = adaptLivePipelineIterationDetail(
        {
          ...minimalDetail,
          pipelineName: '  Release validation  ',
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
          { id: 11, key: 'prepare', label: 'Prepare', sequence: 1, status: 'PASSED' },
          { id: 12, key: 'review', label: 'Review', sequence: 2, status: 'NEEDS_HUMAN' },
        ],
      });
      expect(result).not.toHaveProperty('metrics');
      expect(result).not.toHaveProperty('repository');
      expect(result.stages[1]).not.toHaveProperty('attributes');
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
      ['non-object attributes', { ...minimalDetail, attributes: [] }, 7, 103],
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
