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

import { type ReactElement } from 'react';
import { shallow, type ShallowWrapper } from 'enzyme';
import { SystemMessage } from '@reportportal/ui-kit';

import { DeltaCell, IterationStatusBadge, StageStatusLabel } from 'pages/inside/aiFactory/common';
import { IterationStatus, PipelineComparison, StageKey } from 'types/aiFactory';

import { ComparisonResult } from './comparisonResult';

jest.mock('@reportportal/ui-kit', () => ({ SystemMessage: 'SystemMessage' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage?: string; id?: string },
      values: Record<string, string | number> = {},
    ) =>
      Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage ?? message.id ?? '',
      ),
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
  formatCost: (value: number) => `$${value.toFixed(2)}`,
  formatDuration: (value: number) => `${value} ms`,
}));
jest.mock('pages/inside/aiFactory/common', () => ({
  DeltaCell: 'DeltaCell',
  IterationStatusBadge: 'IterationStatusBadge',
  StageStatusLabel: 'StageStatusLabel',
  STAGE_LABEL_MESSAGE: {
    CREATE: { defaultMessage: 'Create' },
    GRADE: { defaultMessage: 'Grade' },
    UPLOAD: { defaultMessage: 'Upload' },
    REVIEW: { defaultMessage: 'Review' },
    PREPARE: { defaultMessage: 'Prepare' },
    DEVELOP: { defaultMessage: 'Develop' },
    AUTOMATION_REVIEW: { defaultMessage: 'Review' },
    FIX: { defaultMessage: 'Fix' },
  },
}));

const comparison = (overrides: Partial<PipelineComparison> = {}): PipelineComparison => ({
  mode: 'mock-rich',
  pipelineId: 1,
  baseline: {
    id: 101,
    number: 1,
    status: IterationStatus.IN_REVIEW,
    testCasesCount: 4,
    fixRoundsCount: 1,
  },
  candidate: {
    id: 102,
    number: 2,
    status: IterationStatus.COMPLETED,
    testCasesCount: 6,
    fixRoundsCount: 1,
  },
  hasDifferentRequirements: false,
  stages: [
    {
      key: StageKey.CREATE,
      baseline: { status: 'PASSED', cost: 0.2, durationMs: 100 },
      candidate: { status: 'PASSED', cost: 0.3, durationMs: 90 },
    },
  ],
  ...overrides,
});

const renderMetricDelta = (wrapper: ShallowWrapper, index: number): ShallowWrapper =>
  shallow(
    (
      wrapper as unknown as {
        find: (selector: string) => {
          at: (position: number) => { getElement: () => ReactElement };
        };
      }
    )
      .find('MetricDelta')
      .at(index)
      .getElement(),
  );

interface ElementCollection {
  at: (index: number) => { getElement: () => ReactElement };
}

describe('ComparisonResult', () => {
  test('renders the exact warning when iterations reference different requirements', () => {
    const wrapper = shallow(
      <ComparisonResult comparison={comparison({ hasDifferentRequirements: true })} />,
    );

    expect(wrapper.find(SystemMessage).prop('mode')).toBe('warning');
    expect(wrapper.find(SystemMessage).text()).toBe(
      'Different requirements — compare trends, not individual cases',
    );
  });

  test('uses signed directional deltas and a neutral zero without a plus sign', () => {
    const wrapper = shallow(<ComparisonResult comparison={comparison()} />);
    const neutralTestCasesDelta = renderMetricDelta(wrapper, 0).find('.neutral-delta');

    expect(neutralTestCasesDelta.text()).toBe('+2');
    expect(renderMetricDelta(wrapper, 1).find('.neutral-delta').text()).toBe('0');

    const zeroWrapper = shallow(
      <ComparisonResult
        comparison={comparison({
          baseline: {
            id: 101,
            number: 1,
            status: IterationStatus.COMPLETED,
            fixRoundsCount: 1,
          },
          candidate: {
            id: 102,
            number: 2,
            status: IterationStatus.COMPLETED,
            fixRoundsCount: 1,
          },
          stages: [],
        })}
      />,
    );
    expect(renderMetricDelta(zeroWrapper, 0).find('.neutral-delta').text()).toBe('0');
  });

  test.each([
    [2, 4, '+2'],
    [4, 2, '−2'],
  ])('formats neutral delta from %i to %i as %s', (baseline, candidate, expected) => {
    const wrapper = shallow(
      <ComparisonResult
        comparison={comparison({
          baseline: {
            id: 101,
            number: 1,
            status: IterationStatus.COMPLETED,
            fixRoundsCount: baseline,
          },
          candidate: {
            id: 102,
            number: 2,
            status: IterationStatus.COMPLETED,
            fixRoundsCount: candidate,
          },
          stages: [],
        })}
      />,
    );

    expect(renderMetricDelta(wrapper, 0).find('.neutral-delta').text()).toBe(expected);
  });

  test('keeps the requirements warning and no-data state together', () => {
    const wrapper = shallow(
      <ComparisonResult
        comparison={comparison({
          baseline: { id: 101, number: 1, status: IterationStatus.COMPLETED },
          candidate: { id: 102, number: 2, status: IterationStatus.COMPLETED },
          hasDifferentRequirements: true,
          stages: [],
        })}
      />,
    );

    expect(wrapper.find(SystemMessage).text()).toBe(
      'Different requirements — compare trends, not individual cases',
    );
    expect(wrapper.text()).toContain(
      'No comparable stage or metric data is available for these iterations.',
    );
  });

  test('renders status-only identity and stage status without rich metrics or deltas', () => {
    const wrapper = shallow(
      <ComparisonResult
        comparison={comparison({
          mode: 'status-only',
          baseline: { id: 101, number: 1, status: IterationStatus.IN_REVIEW },
          candidate: { id: 102, number: 2, status: IterationStatus.COMPLETED },
          stages: [
            {
              key: 'custom-stage',
              baseline: { status: 'UNKNOWN' },
              candidate: { status: 'PASSED' },
            },
          ],
        })}
      />,
    );
    const identities = wrapper.find('IterationIdentity') as unknown as ElementCollection;
    const baselineIdentity = shallow(identities.at(0).getElement());
    const candidateIdentity = shallow(identities.at(1).getElement());
    const stageEntries = wrapper.find('StageEntry') as unknown as ElementCollection;
    const baselineStage = shallow(stageEntries.at(0).getElement());
    const candidateStage = shallow(stageEntries.at(1).getElement());

    expect(wrapper.find(SystemMessage).prop('mode')).toBe('info');
    expect(wrapper.find(SystemMessage).text()).toContain(
      'iteration identity and stage statuses only',
    );
    expect(baselineIdentity.find(IterationStatusBadge).prop('status')).toBe(
      IterationStatus.IN_REVIEW,
    );
    expect(candidateIdentity.find(IterationStatusBadge).prop('status')).toBe(
      IterationStatus.COMPLETED,
    );
    expect(baselineStage.find(StageStatusLabel)).toHaveLength(0);
    expect(baselineStage.text()).toContain('—');
    expect(candidateStage.find(StageStatusLabel).prop('status')).toBe('PASSED');
    expect(wrapper.text()).toContain('Stage: custom-stage');
    expect(wrapper.find('table')).toHaveLength(0);
    expect(wrapper.find(DeltaCell)).toHaveLength(0);
  });

  test('keeps the completed comparison outside a live region', () => {
    const wrapper = shallow(<ComparisonResult comparison={comparison()} />);

    expect(wrapper.hasClass('result')).toBe(true);
    expect(wrapper.prop('aria-live')).toBeUndefined();
    expect(wrapper.prop('aria-atomic')).toBeUndefined();
    expect(wrapper.prop('role')).toBeUndefined();
  });

  test.each(['__proto__', 'constructor', 'toString'])(
    'uses the generic label for prototype-like stage key %s',
    (key) => {
      const wrapper = shallow(
        <ComparisonResult
          comparison={comparison({
            mode: 'status-only',
            stages: [{ key, candidate: { status: 'PASSED' } }],
          })}
        />,
      );

      expect(wrapper.text()).toContain(`Stage: ${key}`);
    },
  );
});
