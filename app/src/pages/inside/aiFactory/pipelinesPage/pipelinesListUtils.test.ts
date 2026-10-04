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

import { IterationStatus, IterationSummaryRS } from 'types/aiFactory';
import { matchesSearch } from './pipelinesListUtils';

const baseIteration: IterationSummaryRS = {
  id: 101,
  pipelineId: 1,
  number: 1,
  status: IterationStatus.COMPLETED,
  requirement: { specId: 'US-TMS-MIG-001', title: 'Library empty state', jiraKey: 'EPMRPP-104212' },
  trigger: 'Web form · REQUIREMENT',
  startedBy: 'Anatolii Fedosik',
  model: 'auto (default)',
  environment: 'beta5',
  startedAt: Date.parse('2026-09-19T10:13:00Z'),
  durationMs: 580_000,
  testCasesCount: 4,
  suiteScore: 79,
  costTotal: 1.27,
  readyCount: 2,
  fixRoundsCount: 1,
  ciPipeline: { id: '#1284551', url: '#' },
  attributes: [{ key: 'env', value: 'beta5' }],
  stages: [],
};

describe('matchesSearch', () => {
  test('matches everything for an empty search', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', '')).toBe(true);
  });

  test('matches the pipeline name', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', 'generation')).toBe(true);
  });

  test('matches the iteration number with a "#" prefix', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', '#1')).toBe(true);
  });

  test('matches the requirement spec id and title', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', 'empty state')).toBe(true);
  });

  test('does not match unrelated text', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', 'nothing here')).toBe(false);
  });

  test.each(['scheduled', 'review'])('matches reduced iteration field "%s"', (search) => {
    const reducedIteration = {
      kind: 'reduced' as const,
      id: 102,
      pipelineId: 2,
      number: 4,
      status: 'UNKNOWN' as const,
      trigger: 'Scheduled run',
      attributes: [],
      stages: [{ key: 'review', label: 'Review', status: 'UNKNOWN' as const }],
    };

    expect(matchesSearch(reducedIteration, 'Live pipeline', search)).toBe(true);
  });
});
