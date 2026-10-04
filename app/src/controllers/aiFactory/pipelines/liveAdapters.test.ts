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
      adaptLivePipelineIterations(
        [{ id: 103, pipelineId: 7, iterationNumber: 2, stages }],
        7,
      ),
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
});
