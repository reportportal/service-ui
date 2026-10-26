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

import { adaptLivePipelineComparison } from './liveCompareAdapter';

const detail = (id: number, pipelineId: number, iterationNumber: number) => ({
  id,
  pipelineId,
  pipelineName: 'Generation',
  iterationNumber,
  status: 'Passed',
  statusCategory: 'PASSED',
  stages: [],
});

describe('adaptLivePipelineComparison', () => {
  test('keeps published LP4 stages, metrics, and same-scope rows', () => {
    const result = adaptLivePipelineComparison(
      {
        baseline: detail(11, 7, 1),
        candidate: detail(12, 7, 2),
        sameScope: true,
        stages: [
          {
            name: 'Upload',
            baseline: {
              status: 'Passed',
              statusCategory: 'PASSED',
              durationMillis: 14000,
              attributes: [{ key: 'cost', value: '0.02' }],
            },
            candidate: { status: 'Failed', statusCategory: 'FAILED' },
          },
        ],
        metrics: [
          {
            key: 'score',
            label: 'Score',
            valueType: 'NUMBER',
            baseline: '79',
            candidate: '84',
            delta: '5',
            verdict: 'BETTER',
          },
        ],
        sections: [
          {
            sectionKey: 'gradedCases',
            stageName: 'Grade',
            title: 'Graded cases',
            columns: [{ key: 'score', label: 'Score' }],
            rows: [
              {
                key: 'case-1',
                baseline: { cells: { score: 79 } },
                candidate: { cells: { score: { value: '84' } } },
              },
            ],
          },
        ],
      },
      7,
      12,
      11,
    );

    expect(result).toMatchObject({
      mode: 'live',
      baseline: { id: 11, number: 1 },
      candidate: { id: 12, number: 2 },
      stages: [
        {
          name: 'Upload',
          baseline: 'Passed',
          baselineCategory: 'PASSED',
          baselineDurationMs: 14000,
          baselineCost: 0.02,
          candidate: 'Failed',
          candidateCategory: 'FAILED',
        },
      ],
      metrics: [
        {
          label: 'Score',
          valueType: 'NUMBER',
          baseline: '79',
          candidate: '84',
          delta: '5',
          verdict: 'BETTER',
        },
      ],
      sections: [
        { stageName: 'Grade', rows: [{ baseline: { score: '79' }, candidate: { score: '84' } }] },
      ],
    });
    expect(result.rawResponse).toMatchObject({ sameScope: true });
  });

  test('rejects mismatched identities and hides case rows for different scopes', () => {
    expect(() =>
      adaptLivePipelineComparison(
        { baseline: detail(11, 8, 1), candidate: detail(12, 7, 2) },
        7,
        12,
        11,
      ),
    ).toThrow();

    const result = adaptLivePipelineComparison(
      {
        baseline: detail(11, 7, 1),
        candidate: detail(12, 7, 2),
        sameScope: false,
        note: 'Different requirement',
        sections: [{ sectionKey: 'gradedCases', rows: [{ key: 'case-1' }] }],
      },
      7,
      12,
      11,
    );
    expect(result.sections).toEqual([]);
    expect(result.note).toBe('Different requirement');

    const unknownScope = adaptLivePipelineComparison(
      {
        baseline: detail(11, 7, 1),
        candidate: detail(12, 7, 2),
        sections: [{ sectionKey: 'gradedCases', rows: [{ key: 'case-1' }] }],
      },
      7,
      12,
      11,
    );
    expect(unknownScope.sections).toEqual([]);
  });
});

describe('fix iteration subset comparison', () => {
  const metric = {
    key: 'cost',
    label: 'Cost',
    valueType: 'MONEY',
    baseline: '1.27',
    candidate: '0.22',
    delta: '-1.05',
    verdict: 'BETTER',
  };
  const section = { sectionKey: 'gradedCases', title: 'Graded cases', rows: [{ key: 'TC101' }] };

  test.each(['baseline', 'candidate'] as const)(
    'recognizes fix metadata on the %s even when copied scope says true',
    (side) => {
      const payload = {
        baseline: detail(11, 7, 1),
        candidate: detail(12, 7, 2),
        sameScope: true,
        metrics: [metric],
        sections: [section],
      };
      Object.assign(payload[side], {
        attributes: [{ key: 'fixRoundId', type: 'NONE', value: '5' }],
      });
      const result = adaptLivePipelineComparison(payload, 7, 12, 11);
      expect(result.isFixComparison).toBe(true);
      expect(result.sameScope).toBe(true);
      expect(result.metrics).toEqual([
        expect.objectContaining({
          baseline: '1.27',
          candidate: '0.22',
          delta: undefined,
          verdict: undefined,
        }),
      ]);
      expect(result.sections).toEqual([]);
      expect(result.rawResponse).toBe(payload);
      expect(result.rawResponse?.metrics).toEqual([metric]);
    },
  );

  test.each([
    { rerunOf: { id: 11, iterationNumber: 1 } },
    { attributes: [{ key: 'fixRoundId', type: 'TAG', value: '5' }] },
    { attributes: [{ key: 'unrelated', type: 'META', value: 'fix test case' }] },
  ])('preserves an ordinary rerun comparison %p', (provenance) => {
    const result = adaptLivePipelineComparison(
      {
        baseline: detail(11, 7, 1),
        candidate: { ...detail(12, 7, 2), ...provenance },
        sameScope: true,
        metrics: [metric],
        sections: [section],
      },
      7,
      12,
      11,
    );
    expect(result.isFixComparison).not.toBe(true);
    expect(result.metrics[0]).toMatchObject({ delta: '-1.05', verdict: 'BETTER' });
    expect(result.sections).toHaveLength(1);
  });
});
