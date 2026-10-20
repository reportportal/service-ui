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

import type {
  ReducedPipelineDetailStage,
  ReducedPipelineIterationDetail,
} from 'controllers/aiFactory/pipelines';

import { LivePipelineSettingsButton } from '../pipelineSettings';
import { LiveReviewCases } from './liveReviewCases/liveReviewCases';
import { CaseLink } from './stagePanels/caseLink';
import { ReducedIterationDetails } from './reducedIterationDetails';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  ConfigurationIcon: 'ConfigurationIcon',
  CycleArrowsIcon: 'CycleArrowsIcon',
  RefreshIcon: 'RefreshIcon',
  RerunIcon: 'RerunIcon',
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
  ...jest.requireActual<typeof import('common/utils/aiFactoryFormatUtils')>(
    'common/utils/aiFactoryFormatUtils',
  ),
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
jest.mock('../pipelineSettings', () => ({
  LivePipelineSettingsButton: 'LivePipelineSettingsButton',
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

  test.each([
    ['invalid route', { isInvalidRoute: true }, 'Invalid pipeline or iteration address'],
    ['forbidden', { failureKind: 'forbidden' as const }, 'do not have access'],
    ['not found', { failureKind: 'notFound' as const }, 'was not found'],
  ])('offers navigation for %s', (_description, state, message) => {
    const onBack = jest.fn();
    const onRetry = jest.fn();
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={null}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={onRetry}
        onBack={onBack}
        {...state}
      />,
    );

    expect(wrapper.text()).toContain(message);
    const button = wrapper.find('[data-automation-id="backToPipelinesButton"]');
    expect(button).toHaveLength(1);
    (button.prop('onClick') as () => void)();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });

  test('renders live fields and unavailable header actions without mock mutations', () => {
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
      title: 'Release validation · Iteration #3',
      breadcrumbDescriptors,
    });
    expect(wrapper.find('[data-automation-id="reducedIterationDetails"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('Passed');
    expect(wrapper.text()).toContain('Release validation');
    expect(wrapper.text()).toContain('Trigger:CI');
    expect(wrapper.text()).toContain('60000 ms');
    expect(wrapper.text()).toContain('branch:main');
    expect(wrapper.find('[data-automation-id="reducedStageCards"]')).toHaveLength(1);
    expect(wrapper.find('[data-automation-id="reducedStagePanel"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('PreparePassed');
    expect(wrapper.text()).toContain('ReviewNeeds human review');
    expect(wrapper.find('PipelineSettingsButton')).toHaveLength(0);
    expect(wrapper.find('StagePanels')).toHaveLength(0);

    const actions = wrapper
      .find('PageHeaderWithBreadcrumbsAndActions')
      .prop('actions') as ReactElement;
    const actionWrapper = shallow(actions);
    const compare = actionWrapper.find('[data-automation-id="compareWithPreviousButton"]');
    const rerun = actionWrapper.find('[data-automation-id="rerunIterationButton"]');
    expect(compare.text()).toBe('Compare with previous');
    expect(rerun.text()).toBe('Re-run');
    expect(actionWrapper.find(LivePipelineSettingsButton).prop('pipelineId')).toBe(7);
    [compare, rerun].forEach((button) => {
      expect(button.prop('disabled')).toBe(true);
      expect(button.prop('onClick')).toBeUndefined();
    });
    expect(actionWrapper.find('span[title="Comparison is not available yet"]')).toHaveLength(1);
    expect(actionWrapper.find('span[title="Re-run is not available yet"]')).toHaveLength(1);
    const refresh = actionWrapper.find('[data-automation-id="refreshReducedIterationButton"]');
    expect(refresh.prop('disabled')).toBeUndefined();
    const handleRefresh = refresh.prop('onClick') as () => void;
    handleRefresh();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('opens live comparison and joins Review cases only from linked Test Case IDs', () => {
    const onCompare = jest.fn();
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          pipelineType: 'TEST_CASE_GENERATION',
          stages: [
            {
              id: 11,
              key: 'upload',
              label: 'Upload',
              sequence: 1,
              status: 'PASSED',
              relatedEntities: [{ entityType: 'TEST_CASE', entityId: 'TC101' }],
            },
            {
              id: 12,
              key: 'review',
              stageKey: 'review',
              label: 'Review',
              sequence: 2,
              status: 'WAITING',
              ownedBy: 'REPORTPORTAL',
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        requestedStage="review"
        projectKey="project"
        onRetry={jest.fn()}
        onCompare={onCompare}
      />,
    );
    expect(wrapper.find(LiveReviewCases).prop('displayIds')).toEqual(['TC101']);
    const actions = wrapper.find('PageHeaderWithBreadcrumbsAndActions').prop('actions') as ReactElement;
    const compare = shallow(actions).find('[data-automation-id="compareWithPreviousButton"]');
    expect(compare.prop('disabled')).toBe(false);
    (compare.prop('onClick') as () => void)();
    expect(onCompare).toHaveBeenCalledWith(7, 103);
  });

  test.each([
    ['create', 'authoredCases', 'name', 'status'],
    ['grade', 'gradedCases', 'name', 'total'],
    ['upload', 'uploadReport', 'testCase', 'result'],
  ])(
    'renders the %s panel only for a validated generation stage',
    (kind, sectionKey, first, second) => {
      const stage: ReducedPipelineDetailStage = {
        id: 11,
        key: kind,
        stageKey: kind,
        label: kind,
        sequence: 1,
        status: 'PASSED',
        attributes: [{ key: 'source', label: 'Source', value: 'Backend', type: 'META' }],
        sections: [
          {
            key: sectionKey,
            title: 'Results',
            role: 'RESULT',
            columns: [
              { key: first, label: first },
              { key: second, label: second },
            ],
            rows: [{ key: 'one', cells: { [first]: 'Case 1', [second]: 'Passed' }, details: [] }],
          },
        ],
      };
      const wrapper = shallow(
        <ReducedIterationDetails
          iteration={detail({ pipelineType: 'TEST_CASE_GENERATION', stages: [stage] })}
          hasError={false}
          isUnavailable={false}
          breadcrumbDescriptors={breadcrumbDescriptors}
          onRetry={jest.fn()}
        />,
      );

      expect(wrapper.find(`[data-automation-id="live-${kind}-panel"]`)).toHaveLength(1);
      expect(wrapper.find(`[data-automation-id="live-${kind}-results"]`)).toHaveLength(1);
      expect(wrapper.find('[data-automation-id="generationStageHighlights"]').text()).toContain(
        'SourceBackend',
      );
      expect(wrapper.find(`[data-automation-id="live-${kind}-results"]`).text()).toContain(
        'Case 1',
      );
    },
  );

  test.each([
    ['missing stage key', undefined, 'TEST_CASE_GENERATION'],
    ['unrelated pipeline type', 'create', 'OTHER'],
    ['unknown stage key', 'future', 'TEST_CASE_GENERATION'],
  ])('keeps the generic stage panel with %s', (_reason, stageKey, pipelineType) => {
    const stage: ReducedPipelineDetailStage = {
      id: 11,
      key: 'create',
      ...(stageKey ? { stageKey } : {}),
      label: 'Create',
      sequence: 1,
      status: 'PASSED',
      sections: [
        {
          key: 'authoredCases',
          title: 'Authored cases',
          role: 'RESULT',
          columns: [
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
          ],
          rows: [{ key: 'one', cells: { name: 'Case 1', status: 'Passed' }, details: [] }],
        },
      ],
    };
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({ pipelineType, stages: [stage] })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('[data-automation-id="live-create-panel"]')).toHaveLength(0);
    expect(wrapper.find('[data-automation-id="live-create-results"]')).toHaveLength(0);
    expect(wrapper.find('[data-automation-id="reducedStagePanel"]').text()).toContain('Case 1');
  });

  test('keeps an unexpected result section generic while showing the backend values', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          pipelineType: 'TEST_CASE_GENERATION',
          stages: [
            {
              id: 11,
              key: 'create',
              stageKey: 'create',
              label: 'Create',
              sequence: 1,
              status: 'PASSED',
              sections: [
                {
                  key: 'authoredCases',
                  title: 'Unexpected columns',
                  role: 'RESULT',
                  columns: [{ key: 'futureField', label: 'Future field' }],
                  rows: [{ key: 'one', cells: { futureField: 'Backend value' }, details: [] }],
                },
              ],
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('[data-automation-id="live-create-panel"]')).toHaveLength(1);
    expect(wrapper.find('[data-automation-id="live-create-results"]')).toHaveLength(0);
    expect(wrapper.text()).toContain('Backend value');
  });

  test('uses backend categories for the reduced detail status colors', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          status: 'WAITING',
          statusText: 'In review',
          stages: [
            { id: 11, key: 'create', label: 'Create', sequence: 1, status: 'PASSED' },
            {
              id: 12,
              key: 'review',
              label: 'Review',
              sequence: 2,
              status: 'WAITING',
              statusText: 'In progress',
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('.reduced-status').hasClass('reduced-status--waiting')).toBe(true);
    expect(wrapper.find('.reduced-stage__status.reduced-stage__status--done')).toHaveLength(2);
    expect(wrapper.find('.reduced-stage__status.reduced-stage__status--waiting')).toHaveLength(1);
    expect(wrapper.text()).toContain('In review');
    expect(wrapper.text()).toContain('In progress');
  });

  test('explains why the first iteration cannot be compared with a previous one', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({ number: 1 })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );
    const actions = wrapper
      .find('PageHeaderWithBreadcrumbsAndActions')
      .prop('actions') as ReactElement;

    expect(
      shallow(actions).find('span[title="There is no previous iteration to compare"]'),
    ).toHaveLength(1);
  });

  test('colors step statuses from API values and keeps unknown values visible', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          stages: [
            {
              id: 11,
              key: 'create',
              label: 'Create',
              sequence: 1,
              status: 'PASSED',
              sections: [
                {
                  key: 'authoredCases',
                  title: 'Authored test cases',
                  role: 'RESULT',
                  columns: [{ key: 'status', label: 'Step status' }],
                  rows: [
                    { key: 'passed', cells: { status: 'Passed' }, details: [] },
                    { key: 'failed', cells: { status: 'Failed' }, details: [] },
                    { key: 'review', cells: { status: 'In progress' }, details: [] },
                    { key: 'custom', cells: { status: 'Custom backend state' }, details: [] },
                  ],
                },
              ],
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('.reduced-section__status--done').text()).toBe('Passed');
    expect(wrapper.find('.reduced-section__status--failed').text()).toBe('Failed');
    expect(wrapper.find('.reduced-section__status--waiting').text()).toBe('In progress');
    expect(wrapper.find('.reduced-section__status--neutral').text()).toBe('Custom backend state');
  });

  test('colors the upload result from the API', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          stages: [
            {
              id: 11,
              key: 'upload',
              label: 'Upload',
              sequence: 1,
              status: 'PASSED',
              sections: [
                {
                  key: 'uploadReport',
                  title: 'Upload report',
                  role: 'RESULT',
                  columns: [{ key: 'result', label: 'Result' }],
                  rows: [{ key: 'created', cells: { result: 'Created' }, details: [] }],
                },
              ],
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('.reduced-section__status--done').text()).toBe('Created');
  });

  test('renders LP3 totals, waiting message, and section cells from the API', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          startedBy: 'Anatolii Fedosik',
          attributes: [
            { key: 'requirement', value: 'US-TMS-MIG-001', description: 'Empty state' },
            { key: 'testCases', value: '4' },
            { key: 'readyNow', value: '2' },
            { key: 'suiteScore', value: '79' },
          ],
          stages: [
            {
              id: 11,
              key: 'grade',
              label: 'Grade',
              sequence: 1,
              status: 'PASSED',
              summary: '79',
              durationMs: 151000,
              sections: [
                {
                  key: 'gradedCases',
                  title: 'Graded test cases',
                  role: 'RESULT',
                  columns: [
                    { key: 'testCase', label: 'Test case' },
                    { key: 'name', label: 'Name' },
                    { key: 'total', label: 'TOTAL /100' },
                  ],
                  rows: [
                    {
                      key: 'case-1',
                      cells: { testCase: 'TC25602', name: 'Empty state', total: '94' },
                      cellLinks: {
                        testCase: { entityType: 'TEST_CASE', entityId: 'TC25602' },
                      },
                      details: [{ heading: 'Clear steps', items: ['Name the message'] }],
                    },
                  ],
                },
              ],
            },
            {
              id: 12,
              key: 'review',
              label: 'Review',
              sequence: 2,
              status: 'WAITING',
              message: '2 Draft Test Cases wait for review',
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.text()).toContain('US-TMS-MIG-001 · Empty state');
    expect(wrapper.text()).toContain('Anatolii Fedosik');
    expect(wrapper.find('KpiTile[value="2 / 4"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('2 Draft Test Cases wait for review');
    expect(wrapper.text()).toContain('Graded test cases');
    expect(wrapper.text()).toContain('94');
    expect(wrapper.find(CaseLink).props()).toMatchObject({
      name: 'TC25602',
      searchName: 'Empty state',
    });
    expect(wrapper.find('.reduced-section__details-row')).toHaveLength(0);
    (wrapper.find('.reduced-section__details-toggle').prop('onClick') as () => void)();
    expect(wrapper.find('.reduced-section__details-row td').prop('colSpan')).toBe(3);
    expect(wrapper.text()).toContain('Name the message');
  });

  test('shows only the selected stage panel and keeps validated API fields available', () => {
    const iteration = detail({
      rawResponse: { id: 103, pipelineId: 7, backendOnly: { value: 'present' } },
      stages: [
        {
          id: 11,
          key: 'create',
          label: 'Create',
          sequence: 1,
          status: 'PASSED',
          sections: [
            {
              key: 'cases',
              title: 'Authored cases',
              role: 'RESULT',
              columns: [{ key: 'name', label: 'Name' }],
              rows: [{ key: 'one', cells: { name: 'First case' }, details: [] }],
            },
          ],
        },
        {
          id: 12,
          key: 'grade',
          label: 'Grade',
          sequence: 2,
          status: 'PASSED',
          sections: [
            {
              key: 'tokenUsage',
              title: 'Token usage',
              role: 'DETAILS',
              columns: [
                { key: 'model', label: 'Model' },
                { key: 'tokens', label: 'Input', valueType: 'NUMBER' },
                { key: 'cost', label: 'Est. cost', valueType: 'MONEY' },
              ],
              rows: [
                {
                  key: 'total',
                  cells: { model: 'auto', tokens: '8200', cost: '0.02' },
                  details: [],
                },
              ],
            },
          ],
        },
      ],
    });
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={iteration}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('[data-automation-id="reducedStagePanel"]').text()).toContain('First case');
    (wrapper.find('[data-automation-id="reducedStageCard-12"]').prop('onClick') as () => void)();
    expect(wrapper.find('[data-automation-id="reducedStagePanel"]').text()).toContain(
      'Token usage',
    );
    expect(wrapper.find('aside [data-automation-id="reducedStageDetailSections"]')).toHaveLength(1);
    expect(wrapper.find('[data-automation-id="reducedStageDetailSections"]').text()).toContain(
      'Token usage',
    );
    expect(wrapper.find('[data-automation-id="reducedStageDetailSections"] dl').text()).toContain(
      '8.2k',
    );
    expect(wrapper.find('[data-automation-id="reducedStageDetailSections"] dl').text()).toContain(
      '$0.02',
    );
    expect(wrapper.find('[data-automation-id="reducedStagePanel"]').text()).not.toContain(
      'First case',
    );
    expect(wrapper.text()).toContain('"pipelineId": 7');
    expect(wrapper.text()).not.toContain('"backendOnly"');
    const toggle = wrapper
      .find('[data-automation-id="fullApiResponse"]')
      .prop('onToggle') as (event: { currentTarget: { open: boolean } }) => void;
    toggle({ currentTarget: { open: true } });
    expect(wrapper.text()).toContain('"backendOnly"');
  });

  test('links a CI job when the API supplies an HTTP URL', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          stages: [
            {
              id: 11,
              key: 'create',
              label: 'Create',
              sequence: 1,
              status: 'PASSED',
              links: [
                {
                  type: 'RUN',
                  label: '#8812301',
                  url: 'https://gitlab.epam.com/epm-rpp/rp-tests/-/jobs/8812301',
                },
                { type: 'RUN', label: '#unsafe', url: 'javascript:alert(1)' },
              ],
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('.details-list a').props()).toMatchObject({
      href: 'https://gitlab.epam.com/epm-rpp/rp-tests/-/jobs/8812301',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    expect(wrapper.find('.details-list a').text()).toBe('#8812301');
    expect(wrapper.text()).toContain('#unsafe');
    expect(wrapper.find('.details-list a')).toHaveLength(1);
  });

  test('opens the requested stage when the route provides a stage name', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail()}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        requestedStage="review"
        onRetry={jest.fn()}
      />,
    );

    expect(wrapper.find('[data-automation-id="reducedStageCard-12"]').prop('aria-pressed')).toBe(
      true,
    );
    expect(wrapper.find('[data-automation-id="reducedStagePanel"]').text()).toContain('Review');
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
