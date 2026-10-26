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

import { shallow, type CommonWrapper } from 'enzyme';

import type { LivePipelineComparison } from 'controllers/aiFactory/pipelines';

import { LiveComparisonResult } from './liveComparisonResult';

jest.mock('@reportportal/ui-kit', () => ({ SystemMessage: 'SystemMessage' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }, values?: { number: number }) =>
      message.defaultMessage.replace('{number}', String(values?.number ?? '')),
  }),
}));
jest.mock('common/utils', () => ({
  formatCost: (value: number) => `$${value.toFixed(2)}`,
  formatDuration: (value: number) => `${value} ms`,
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));

const comparison = (sameScope: boolean | undefined): LivePipelineComparison => ({
  mode: 'live',
  pipelineId: 7,
  baseline: { id: 11, number: 1, status: 'PASSED', statusText: 'Passed' },
  candidate: { id: 12, number: 2, status: 'WAITING', statusText: 'In review' },
  sameScope,
  stages: [{ key: 'upload', name: 'Upload', baseline: 'Passed', candidate: 'Failed' }],
  metrics: [{ key: 'score', label: 'Score', baseline: '79', candidate: '84', delta: '5' }],
  sections: [
    {
      key: 'gradedCases',
      title: 'Graded cases',
      columns: [{ key: 'total', label: 'Total' }],
      rows: [{ key: 'case-1', baseline: { total: '79' }, candidate: { total: '84' } }],
    },
  ],
});

interface TestNodes {
  map: <T>(callback: (node: CommonWrapper) => T) => T[];
}

describe('LiveComparisonResult', () => {
  test('shows server stages, metrics, and case rows for the confirmed same scope', () => {
    const wrapper = shallow(<LiveComparisonResult comparison={comparison(true)} />);
    expect(wrapper.text()).toContain('Upload');
    expect(wrapper.text()).toContain('Score');
    expect(wrapper.text()).toContain('Graded cases');
    expect(wrapper.text()).toContain('84');
  });

  test('explains an unconfirmed scope', () => {
    const wrapper = shallow(<LiveComparisonResult comparison={comparison(undefined)} />);
    expect(wrapper.find('SystemMessage').text()).toContain('did not confirm');
  });

  test('shows published metric metadata and section stage identity as plain text', () => {
    const data = comparison(true);
    data.metrics[0] = { ...data.metrics[0], valueType: 'NUMBER', verdict: 'BETTER' };
    data.sections[0] = { ...data.sections[0], stageName: 'Grade' };

    const wrapper = shallow(<LiveComparisonResult comparison={data} />);

    expect(wrapper.text()).toContain('Number');
    expect(wrapper.text()).toContain('Verdict');
    expect(wrapper.text()).toContain('Better');
    expect(wrapper.text()).toContain('Grade · Graded cases');
  });

  test('styles live iteration statuses and exposes the unmodified API payload', () => {
    const data = comparison(true);
    data.rawResponse = { baseline: { id: 11 }, backendOnly: { value: 'present' } };
    data.metrics[0] = {
      ...data.metrics[0],
      valueType: 'MONEY',
      baseline: '1.27',
      candidate: '2.00',
      delta: '+0.73',
    };

    const wrapper = shallow(<LiveComparisonResult comparison={data} />);

    expect(wrapper.find('.live-status--success')).toHaveLength(1);
    expect(wrapper.find('.live-status--warning')).toHaveLength(1);
    expect(wrapper.text()).toContain('$1.27');
    expect(wrapper.text()).toContain('+$0.73');
    expect(wrapper.find('[data-automation-id="fullComparisonApiResponse"]').text()).toContain(
      'backendOnly',
    );
  });
});

describe('fix subset comparison rendering', () => {
  test('shows independent values without a suite delta, verdict, backend conclusion or case table', () => {
    const data = comparison(true);
    data.isFixComparison = true;
    data.note = 'The suite improved';
    data.metrics = [
      {
        key: 'cost',
        label: 'Cost',
        valueType: 'MONEY',
        baseline: '1.27',
        candidate: '0.22',
        delta: '-1.05',
        verdict: 'BETTER',
      },
    ];
    data.stages[0] = {
      ...data.stages[0],
      baselineDurationMs: 1000,
      candidateDurationMs: 200,
      baselineCost: 1.27,
      candidateCost: 0.22,
    };
    data.rawResponse = { note: data.note, metrics: data.metrics, sections: data.sections };

    const wrapper = shallow(<LiveComparisonResult comparison={data} />);
    const raw = wrapper.find('[data-automation-id="fullComparisonApiResponse"]');
    expect(raw.text()).toContain('The suite improved');
    expect(raw.text()).toContain('BETTER');
    const headings = (wrapper.find('th') as unknown as TestNodes).map((node) => node.text());
    expect(headings).not.toContain('Delta');
    expect(headings).not.toContain('Verdict');
    expect(wrapper.find('SystemMessage').text().toLowerCase()).toContain('subset');
    expect(wrapper.find('SystemMessage').text()).not.toContain('The suite improved');
    expect(
      (wrapper.find('.section__title') as unknown as TestNodes).map((node) => node.text()),
    ).not.toContain('Graded cases');
    expect((wrapper.find('td') as unknown as TestNodes).map((node) => node.text())).toEqual([
      'CostMoney',
      '$1.27',
      '$0.22',
    ]);
    expect(
      (wrapper.find('StageComparisonEntry') as unknown as TestNodes).map((node) => node.props()),
    ).toEqual([
      expect.objectContaining({ durationMs: 1000, cost: 1.27, status: 'Passed' }),
      expect.objectContaining({ durationMs: 200, cost: 0.22, status: 'Failed' }),
    ]);
  });
});
