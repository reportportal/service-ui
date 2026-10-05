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

import { ReactElement } from 'react';
import { shallow } from 'enzyme';

import type { ReducedPipelineIterationDetail } from 'controllers/aiFactory/pipelines';

import { ReducedIterationDetails } from './reducedIterationDetails';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  RefreshIcon: 'RefreshIcon',
  SystemMessage: 'SystemMessage',
}));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('common/utils/timeDateUtils', () => ({
  formatDuration: (value: number) => `${value} ms`,
}));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'ScrollWrapper' }));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'SettingsLayout' }));
jest.mock('../../common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: 'PageHeaderWithBreadcrumbsAndActions',
}));

const breadcrumbDescriptors = [{ id: 'iteration', title: 'Iteration #3' }];

const detail = (overrides: Partial<ReducedPipelineIterationDetail> = {}) => ({
  kind: 'reduced' as const,
  id: 103,
  pipelineId: 7,
  number: 3,
  pipelineName: 'Release validation',
  status: 'PASSED' as const,
  trigger: 'CI',
  startedAt: Date.parse('2026-10-04T10:00:00.000Z'),
  durationMs: 60_000,
  attributes: [{ key: 'branch', value: 'main' }],
  stages: [
    { id: 11, key: 'prepare', label: 'Prepare', sequence: 1, status: 'PASSED' as const },
    { id: 12, key: 'review', label: 'Review', sequence: 2, status: 'NEEDS_HUMAN' as const },
  ],
  ...overrides,
});

describe('ReducedIterationDetails', () => {
  test.each([
    ['unavailable', false, true, 'polite', 'info', 'unavailable'],
    ['failed', true, false, 'assertive', 'error', 'could not be loaded'],
    ['missing', false, false, 'polite', 'info', 'unavailable'],
  ])(
    'renders the %s state with an explicit manual retry',
    (_description, hasError, isUnavailable, ariaLive, mode, message) => {
      const onRetry = jest.fn();
      const wrapper = shallow(
        <ReducedIterationDetails
          iteration={null}
          hasError={hasError}
          isUnavailable={isUnavailable}
          breadcrumbDescriptors={breadcrumbDescriptors}
          onRetry={onRetry}
        />,
      );

      expect(wrapper.find('output').prop('aria-live')).toBe(ariaLive);
      expect(wrapper.find('SystemMessage').prop('mode')).toBe(mode);
      expect(wrapper.find('SystemMessage').text().toLowerCase()).toContain(message);
      const retry = wrapper.find('[data-automation-id="retryReducedIterationButton"]');
      expect(retry).toHaveLength(1);
      const handleRetry = retry.prop('onClick') as () => void;
      handleRetry();
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(wrapper.find('PageHeaderWithBreadcrumbsAndActions')).toHaveLength(0);
    },
  );

  test('renders safe generic fields and refresh without rich KPI, settings, compare, or panel controls', () => {
    const onRetry = jest.fn();
    const iteration = detail();
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={iteration}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={onRetry}
      />,
    );

    expect(wrapper.find('PageHeaderWithBreadcrumbsAndActions').props()).toMatchObject({
      title: 'Iteration #3',
      breadcrumbDescriptors,
    });
    expect(wrapper.find('[data-automation-id="reducedIterationDetails"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('Passed');
    expect(wrapper.text()).toContain('Release validation · CI');
    expect(wrapper.text()).toContain('60000 ms');
    expect(wrapper.text()).toContain('branch: main');
    expect(wrapper.text()).toContain('PreparePassed');
    expect(wrapper.text()).toContain('ReviewNeeds human review');
    expect(wrapper.find('KpiTile')).toHaveLength(0);
    expect(wrapper.find('PipelineSettingsButton')).toHaveLength(0);
    expect(wrapper.find('StagePanels')).toHaveLength(0);

    const refresh = wrapper
      .find('PageHeaderWithBreadcrumbsAndActions')
      .prop('actions') as ReactElement;
    const refreshWrapper = shallow(refresh);
    expect(refreshWrapper.prop('data-automation-id')).toBe('refreshReducedIterationButton');
    const handleRefresh = refreshWrapper.prop('onClick') as () => void;
    handleRefresh();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('renders an explicit empty-stage message without leaking absent optional metadata', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          pipelineName: undefined,
          trigger: undefined,
          startedAt: undefined,
          durationMs: undefined,
          attributes: [],
          stages: [],
          status: 'UNKNOWN',
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.text()).toContain('Unknown');
    expect(wrapper.text()).toContain('No stages are available for this iteration');
    expect(wrapper.find('.meta')).toHaveLength(0);
    expect(wrapper.find('.attributes')).toHaveLength(0);
  });
});
