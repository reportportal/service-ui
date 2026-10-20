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
