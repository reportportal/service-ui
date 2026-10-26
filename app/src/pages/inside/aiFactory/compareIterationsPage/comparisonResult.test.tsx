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

import { shallow } from 'enzyme';

import type { LivePipelineComparison } from 'controllers/aiFactory/pipelines';

import { ComparisonResult } from './comparisonResult';
import { LiveComparisonResult } from './liveComparisonResult';

jest.mock('@reportportal/ui-kit', () => ({ SystemMessage: 'SystemMessage' }));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
  formatCost: (value: number) => `$${value.toFixed(2)}`,
  formatDuration: (value: number) => `${value} ms`,
}));

const comparison: LivePipelineComparison = {
  mode: 'live',
  projectKey: 'demo',
  pipelineId: 7,
  baseline: { id: 11, number: 1, status: 'PASSED' },
  candidate: { id: 12, number: 2, status: 'WAITING' },
  sameScope: true,
  stages: [],
  metrics: [{ key: 'score', label: 'Score', baseline: '79', candidate: '84', delta: '5' }],
  sections: [],
};

describe('ComparisonResult', () => {
  test('passes the published comparison unchanged to the live renderer', () => {
    const wrapper = shallow(<ComparisonResult comparison={comparison} />);

    expect(wrapper.find(LiveComparisonResult)).toHaveLength(1);
    expect(wrapper.prop('comparison')).toBe(comparison);
  });
});
