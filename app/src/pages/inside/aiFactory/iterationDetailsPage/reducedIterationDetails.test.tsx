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

import { act, ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { shallow, type CommonWrapper } from 'enzyme';
import Link from 'redux-first-router-link';

import type {
  ReducedPipelineDetailStage,
  ReducedPipelineIterationDetail,
} from 'controllers/aiFactory/pipelines';
import { adaptLivePipelineIterationDetail } from 'controllers/aiFactory/pipelines/liveAdapters';
import { loadStageTrace, type StageTrace } from 'controllers/aiFactory/stageTrace';
import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';

import { LivePipelineSettingsButton } from '../pipelineSettings';
import { IterationProvenance } from './iterationProvenance';
import { KpiTile } from './kpiTile';
import { LiveStageRetryAction } from './liveStageRetryAction';
import { StageTraceAction } from './stageTraceAction/stageTraceAction';
import {
  IterationStageTraceEntry,
  type IterationStageTraceEntryProps,
} from './stageTraceAction/iterationStageTraceEntry';
import { getLiveLibraryCaseFolder } from './liveReviewCases/liveLibraryCases';
import { LiveReviewCases } from './liveReviewCases/liveReviewCases';
import { CaseLink } from './stagePanels/caseLink';
import {
  ReducedIterationDetails,
  type ReducedIterationDetailsProps,
} from './reducedIterationDetails';

jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: () => true }));
jest.mock('controllers/aiFactory/stageTrace', () => ({ loadStageTrace: jest.fn() }));
jest.mock('redux-first-router-link', () => jest.fn(() => null));
jest.mock('./liveReviewCases/liveLibraryCases', () => ({ getLiveLibraryCaseFolder: jest.fn() }));
jest.mock('react-redux', () => ({
  ...jest.requireActual<typeof import('react-redux')>('react-redux'),
  useSelector: () => ({ organizationSlug: 'my-org', projectSlug: 'my-project' }),
}));

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  ChevronDownDropdownIcon: () => <svg />,
  ConfigurationIcon: 'ConfigurationIcon',
  CycleArrowsIcon: 'CycleArrowsIcon',
  RefreshIcon: 'RefreshIcon',
  RerunIcon: 'RerunIcon',
  SystemMessage: 'SystemMessage',
}));
jest.mock('react-intl', () => {
  const { reactIntlTestMock } = jest.requireActual<
    typeof import('pages/inside/aiFactory/aiFactoryTestUtils')
  >('pages/inside/aiFactory/aiFactoryTestUtils');

  return {
    ...reactIntlTestMock,
    useIntl: () => ({
      ...reactIntlTestMock.useIntl(),
      formatNumber: (value: number, options: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat('en', options).format(value),
    }),
  };
});
jest.mock('common/utils', () => ({
  ...jest.requireActual<typeof import('common/utils/aiFactoryFormatUtils')>(
    'common/utils/aiFactoryFormatUtils',
  ),
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'ScrollWrapper' }));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'SettingsLayout' }));
jest.mock('../../common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: 'PageHeaderWithBreadcrumbsAndActions',
}));
jest.mock('../pipelineSettings', () => ({
  LivePipelineSettingsButton: 'LivePipelineSettingsButton',
}));

interface TestNodes {
  map: <T>(callback: (node: CommonWrapper) => T) => T[];
}

const traceEntry = (wrapper: CommonWrapper) =>
  shallow(
    <IterationStageTraceEntry
      {...(wrapper
        .find(IterationStageTraceEntry)
        .props() as unknown as IterationStageTraceEntryProps)}
    />,
  );

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

const renderTraceDetail = (
  stages: ReducedPipelineDetailStage[],
  overrides: Partial<ReducedIterationDetailsProps> = {},
) =>
  shallow(
    <ReducedIterationDetails
      iteration={detail({ stages })}
      hasError={false}
      isUnavailable={false}
      breadcrumbDescriptors={breadcrumbDescriptors}
      onRetry={jest.fn()}
      projectKey="demo"
      {...overrides}
    />,
  );

describe('ReducedIterationDetails', () => {
  describe('Grade report from an existing iteration', () => {
    const gradeReport = {
      case_count: 1,
      max_score: 100,
      total_score: 95,
      test_cases: [
        {
          name: 'Viewer cannot delete a folder',
          line: 136,
          total_score: 95,
          criterias: [
            {
              name: 'no_invented_logic',
              max_score: 20,
              score: 15,
              failure_reasons: ['The source does not say that the menu is hidden.'],
            },
            { name: 'atomicity', max_score: 15, score: 15, failure_reasons: [] },
            { name: 'clear_steps', max_score: 20, score: 20, failure_reasons: [] },
            { name: 'expected_results', max_score: 20, score: 20, failure_reasons: [] },
            { name: 'no_invented_ui', max_score: 15, score: 15, failure_reasons: [] },
            { name: 'coherence', max_score: 10, score: 10, failure_reasons: [] },
          ],
        },
      ],
    };
    const gradeOutput = `\`\`\`json\n${JSON.stringify(gradeReport)}\n\`\`\``;

    const renderGrade = (
      message?: string,
      additionalSections: ReducedPipelineDetailStage['sections'] = [],
    ) =>
      shallow(
        <ReducedIterationDetails
          iteration={detail({
            pipelineType: 'TEST_CASE_GENERATION',
            stages: [
              {
                id: 11,
                key: 'grade',
                stageKey: 'grade',
                label: 'Grade',
                sequence: 1,
                status: 'PASSED',
                attempt: 1,
                sections: [
                  ...additionalSections,
                  ...(message === undefined
                    ? []
                    : [
                        {
                          key: 'transcript',
                          title: 'Transcript',
                          role: 'DETAILS' as const,
                          columns: [{ key: 'action', label: 'Action' }],
                          rows: [
                            {
                              key: 'tool',
                              cells: { kind: 'Tool', action: gradeOutput },
                              details: [],
                            },
                            {
                              key: 'message',
                              cells: { kind: 'Message', action: 'Message — preview' },
                              details: [{ heading: 'Message', items: [message] }],
                            },
                            {
                              key: 'usage',
                              cells: { kind: 'Usage', action: 'usage: 123 tokens' },
                              details: [],
                            },
                          ],
                        },
                      ]),
                ],
              },
            ],
          })}
          hasError={false}
          isUnavailable={false}
          breadcrumbDescriptors={breadcrumbDescriptors}
          onRetry={jest.fn()}
          projectKey="demo"
        />,
      );

    test('shows reported totals and reveals individual scores and reasons', () => {
      const wrapper = renderGrade(gradeOutput);
      const results = '[data-automation-id="live-grade-results"]';
      expect(wrapper.find('TraceGradeResults')).toHaveLength(0);
      expect(wrapper.find(results).text()).toContain('Suite score 95 / 100');
      const caseName = wrapper.find(`${results} .reduced-section__grade-case`).find(CaseLink);
      expect(caseName.props()).toMatchObject({
        name: 'Viewer cannot delete a folder',
        searchName: 'Viewer cannot delete a folder',
      });
      expect(wrapper.find(`${results} button`).find(CaseLink)).toHaveLength(0);
      expect(wrapper.find(results).text()).toContain('A /15');
      expect(wrapper.find(results).text()).toContain('CS /20');
      expect(wrapper.find(results).text()).toContain('CER /20');
      expect(wrapper.find(results).text()).toContain('NIL /20');
      expect(wrapper.find(results).text()).toContain('NIU /15');
      expect(wrapper.find(results).text()).toContain('C /10');
      expect(wrapper.find(results).text()).toContain('Total /100');
      expect(wrapper.find(results).text()).not.toContain('136');
      expect(wrapper.find(results).text()).not.toContain('Score details');
      expect(wrapper.find(results).text()).not.toContain('No invented logic · 15/20');

      (wrapper.find(`${results} button`).prop('onClick') as () => void)();

      expect(wrapper.find(results).text()).toContain('No invented logic · 15/20');
      expect(wrapper.find(results).text()).not.toContain('136');
      expect(wrapper.find(results).text()).toContain(
        'The source does not say that the menu is hidden.',
      );
    });

    test.each([
      'This report is incomplete',
      `\`\`\`json\n${JSON.stringify({ ...gradeReport, case_count: 2 })}\n\`\`\``,
    ])('ignores an invalid final message even when a tool call has valid JSON', (message) => {
      const wrapper = renderGrade(message);
      expect(wrapper.find('[data-automation-id="live-grade-results"]')).toHaveLength(0);
      expect(wrapper.text()).toContain('Transcript');
    });

    test('prefers the dedicated Result section when provided by the pipeline', () => {
      const wrapper = renderGrade(gradeOutput, [
        {
          key: 'gradedCases',
          title: 'Reported scores',
          role: 'RESULT',
          columns: [
            { key: 'name', label: 'Case' },
            { key: 'line', label: 'Source line', valueType: 'NUMBER' },
            { key: 'total', label: 'Score' },
          ],
          rows: [
            { key: '1', cells: { name: 'Reported case', line: '136', total: '100' }, details: [] },
          ],
        },
      ]);
      const results = wrapper.find('[data-automation-id="live-grade-results"]');
      expect(wrapper.find('TraceGradeResults')).toHaveLength(0);
      expect(results).toHaveLength(1);
      const headers = results.find('th') as unknown as TestNodes;
      const cells = results.find('td') as unknown as TestNodes;
      expect(headers.map((header) => header.text())).toEqual(['Case', 'Score']);
      expect(cells.map((cell) => cell.text())).toEqual(['Reported case', '100']);
      expect(results.text()).not.toContain('Viewer cannot delete a folder');
    });

    const trace: StageTrace = {
      iterationId: 103,
      stageKey: 'grade',
      attempt: 1,
      status: 'REPORTED',
      events: [
        { seq: 74, type: 'TOOL_CALL', title: 'mcp', text: gradeOutput },
        { seq: 75, type: 'AGENT', title: 'Message', text: gradeOutput },
        { seq: 76, type: 'STEP', title: 'Usage' },
        { seq: 77, type: 'FINAL', title: 'Result' },
      ],
    };

    test.each([
      { title: 'shows the final message from the current trace', trace, hasResults: true },
      {
        title: 'ignores a tool call containing scores when the final message is invalid',
        trace: {
          ...trace,
          events: trace.events.map((event) =>
            event.seq === 75 ? { ...event, text: 'Incomplete report' } : event,
          ),
        },
        hasResults: false,
      },
      {
        title: 'handles an unreported trace',
        trace: { ...trace, status: 'NOT_REPORTED' as const, events: [] },
        hasResults: false,
      },
    ])('$title', async ({ trace: traceResponse, hasResults }) => {
      jest.mocked(loadStageTrace).mockResolvedValueOnce(traceResponse);
      const fallback = renderGrade().find('TraceGradeResults') as CommonWrapper & {
        getElement: () => ReactElement;
      };
      const container = document.createElement('div');
      const root = createRoot(container);
      const environment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
      const previousActEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
      environment.IS_REACT_ACT_ENVIRONMENT = true;
      try {
        await act(async () => {
          root.render(fallback.getElement());
          await Promise.resolve();
        });
        expect(loadStageTrace).toHaveBeenLastCalledWith(
          { projectKey: 'demo', iterationId: 103, stageKey: 'grade', attempt: 1 },
          expect.any(AbortSignal),
        );
        const results = container.querySelector('[data-automation-id="live-grade-results"]');
        if (hasResults) {
          expect(results?.textContent).toContain('Suite score 95 / 100');
          expect(results?.textContent).toContain('Total /100');
          expect(Link).toHaveBeenCalledWith(
            expect.objectContaining({
              children: 'Viewer cannot delete a folder',
              to: expect.objectContaining({
                query: { testCasesSearchParams: 'Viewer cannot delete a folder' },
              }),
            }),
            expect.anything(),
          );
        } else {
          expect(results).toBeNull();
        }
      } finally {
        act(() => root.unmount());
        environment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
      }
    });
  });

  test('opens only the selected actual stageKey, with no synthetic key fallback', () => {
    const wrapper = renderTraceDetail(
      [
        {
          id: 11,
          key: 'synthetic',
          stageKey: 'agent-create',
          label: 'Create',
          sequence: 1,
          status: 'PASSED',
        },
        { id: 12, key: 'upload', label: 'Upload', sequence: 2, status: 'PASSED' },
      ],
      { requestedStage: 'agent-create' },
    );
    expect(traceEntry(wrapper).find(StageTraceAction).prop('stageKey')).toBe('agent-create');
    expect(wrapper.find('.stage-details-heading > IterationStageTraceEntry')).toHaveLength(1);
    (wrapper.find('[data-automation-id="reducedStageCard-12"]').prop('onClick') as () => void)();
    expect(traceEntry(wrapper).find(StageTraceAction)).toHaveLength(0);
  });

  test('defaults to the first stage when a later legacy stage has no canonical stage key', () => {
    const wrapper = renderTraceDetail([
      { id: 11, key: 'create', stageKey: 'create', label: 'Create', sequence: 1, status: 'PASSED' },
      { id: 12, key: 'legacy-upload', label: 'Upload', sequence: 2, status: 'PASSED' },
    ]);
    expect(traceEntry(wrapper).find(StageTraceAction).prop('stageKey')).toBe('create');
  });

  test.each(['TEST_CASE_GENERATION', undefined])(
    'human generation Review with type %s shows Library cases without trace controls',
    (pipelineType) => {
      const wrapper = shallow(
        <ReducedIterationDetails
          iteration={detail({
            pipelineType,
            stages: [
              {
                id: 12,
                key: 'review',
                stageKey: 'review',
                label: 'Review',
                ownedBy: 'REPORTPORTAL',
                sequence: 1,
                status: 'NEEDS_HUMAN',
              },
            ],
          })}
          hasError={false}
          isUnavailable={false}
          breadcrumbDescriptors={breadcrumbDescriptors}
          onRetry={jest.fn()}
          projectKey="demo"
        />,
      );
      const libraryCases = wrapper.find(LiveReviewCases);
      expect(libraryCases).toHaveLength(1);
      expect(libraryCases.prop('children')).toBeUndefined();
      expect(traceEntry(wrapper).find(StageTraceAction)).toHaveLength(0);
    },
  );

  test('automation review has its own trace', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          pipelineType: 'TEST_CASE_AUTOMATION',
          stages: [
            {
              id: 12,
              key: 'review',
              stageKey: 'review',
              label: 'Review',
              ownedBy: 'REPORTPORTAL',
              sequence: 1,
              status: 'PASSED',
            },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
        projectKey="demo"
      />,
    );
    expect(traceEntry(wrapper).find(StageTraceAction).prop('stageKey')).toBe('review');
  });

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

  test('renders live fields and keeps Re-run disabled when the manager can see it', () => {
    const onRetry = jest.fn();
    const iteration = detail();
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={iteration}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={onRetry}
        showRerun
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
    expect(wrapper.text()).toContain('1m');
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
    expect(compare.prop('disabled')).toBe(true);
    expect(compare.prop('onClick')).toBeUndefined();
    expect(rerun.prop('disabled')).toBeUndefined();
    expect(actionWrapper.find('span[title="Comparison is not available yet"]')).toHaveLength(1);
    const refresh = actionWrapper.find('[data-automation-id="refreshReducedIterationButton"]');
    expect(refresh.prop('disabled')).toBe(false);
    const handleRefresh = refresh.prop('onClick') as () => void;
    handleRefresh();
    expect(onRetry).toHaveBeenCalledTimes(1);

    wrapper.setProps({ isLoading: true });
    const loadingActions = wrapper
      .find('PageHeaderWithBreadcrumbsAndActions')
      .prop('actions') as ReactElement;
    expect(
      shallow(loadingActions)
        .find('[data-automation-id="refreshReducedIterationButton"]')
        .prop('disabled'),
    ).toBe(true);

    wrapper.setProps({ showRerun: false });
    const restrictedActions = wrapper
      .find('PageHeaderWithBreadcrumbsAndActions')
      .prop('actions') as ReactElement;
    expect(
      shallow(restrictedActions).find('[data-automation-id="rerunIterationButton"]'),
    ).toHaveLength(0);
  });

  test('keeps the last details visible when automatic refresh fails', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail()}
        hasError
        isUnavailable={false}
        breadcrumbDescriptors={[]}
        onRetry={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(wrapper.text()).toContain('Automatic refresh paused');
    expect(wrapper.find('[data-automation-id="reducedIterationDetails"]')).toHaveLength(1);
    wrapper.unmount();
  });

  test('opens live comparison and requests Review cases for the numeric iteration ID', () => {
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
    expect(wrapper.find(LiveReviewCases).prop('iterationId')).toBe(103);
    expect(wrapper.find(LiveReviewCases).prop('projectKey')).toBe('project');
    const actions = wrapper
      .find('PageHeaderWithBreadcrumbsAndActions')
      .prop('actions') as ReactElement;
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
    async (kind, sectionKey, first, second) => {
      const caseLabel = kind === 'upload' ? 'TC123' : 'Case 1';
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
            rows: [{ key: 'one', cells: { [first]: caseLabel, [second]: 'Passed' }, details: [] }],
          },
        ],
      };
      const wrapper = shallow(
        <ReducedIterationDetails
          iteration={detail({ pipelineType: 'TEST_CASE_GENERATION', stages: [stage] })}
          hasError={false}
          isUnavailable={false}
          breadcrumbDescriptors={breadcrumbDescriptors}
          projectKey="demo"
          onRetry={jest.fn()}
        />,
      );

      expect(wrapper.find(`[data-automation-id="live-${kind}-panel"]`)).toHaveLength(1);
      const results = wrapper.find(`[data-automation-id="live-${kind}-results"]`);
      expect(results).toHaveLength(1);
      const highlights = wrapper.find('[data-automation-id="generationStageHighlights"]');
      if (kind === 'upload') {
        expect(highlights).toHaveLength(0);
      } else {
        expect(highlights.text()).toContain('SourceBackend');
      }
      expect(results.text()).toContain(caseLabel);

      const libraryLink = results.find('UploadReportLibraryLink');
      if (kind === 'upload') {
        expect(libraryLink).toHaveLength(1);
        const [action, heading] = results.prop('children') as ReactElement[];
        expect(heading.type).toBe('h3');
        jest.mocked(getLiveLibraryCaseFolder).mockResolvedValueOnce(42);
        const root = createRoot(document.createElement('div'));
        const environment = globalThis as typeof globalThis & {
          IS_REACT_ACT_ENVIRONMENT?: boolean;
        };
        const previousActEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
        environment.IS_REACT_ACT_ENVIRONMENT = true;
        try {
          await act(async () => {
            root.render(action);
            await Promise.resolve();
          });
          expect(getLiveLibraryCaseFolder).toHaveBeenCalledWith(
            'demo',
            'TC123',
            expect.any(AbortSignal),
          );
          expect(Link).toHaveBeenCalledWith(
            expect.objectContaining({
              children: 'View in Test Library',
              to: {
                type: TEST_CASE_LIBRARY_PAGE,
                payload: {
                  organizationSlug: 'my-org',
                  projectSlug: 'my-project',
                  testCasePageRoute: 'folder/42',
                },
                query: { iteration: '103' },
              },
            }),
            expect.anything(),
          );
        } finally {
          act(() => root.unmount());
          environment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
        }
      } else {
        expect(libraryLink).toHaveLength(0);
      }
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

  test('keeps the fix iteration cost independent from the original iteration', () => {
    const iteration = detail({
      rerunOf: { id: 31, iterationNumber: 1 },
      attributes: [
        { key: 'cost', value: '0.22' },
        { key: 'fixRoundId', type: 'NONE', value: '5' },
      ],
      rawResponse: { originalIterationCost: 1.27 },
    });
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={iteration}
        projectKey="project"
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );
    expect(wrapper.find(IterationProvenance).props()).toEqual({ iteration, projectKey: 'project' });
    const kpiValues = (wrapper.find(KpiTile) as unknown as TestNodes).map((node) =>
      node.prop('value'),
    );
    expect(kpiValues).toContain('$0.22');
    expect(kpiValues).not.toContain('$1.49');
    expect(kpiValues).not.toContain('$1.27');
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

  test.each([
    { status: 'PASSED', statusText: 'Done', ready: 9, barCount: 0 },
    { status: 'WAITING', statusText: 'In progress', ready: 7, barCount: 1 },
  ] as const)('shows $ready/9 Ready and $barCount progress bars when Review is $statusText', ({
    status,
    statusText,
    ready,
    barCount,
  }) => {
    const wrapper = renderTraceDetail([
      {
        id: 12,
        key: 'review',
        stageKey: 'review',
        label: 'Review',
        sequence: 1,
        status,
        statusText,
        summary: `${ready}/9 Ready`,
        attributes: [
          { key: 'ready', value: String(ready) },
          { key: 'total', value: '9' },
        ],
      },
    ]);

    const card = wrapper.find('[data-automation-id="reducedStageCard-12"]');
    expect(card.text()).toContain(statusText);
    expect(card.text()).toContain(`${ready}/9 Ready`);
    expect(card.find('ScoreBar')).toHaveLength(barCount);
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

  test.each(['unit', 'name', undefined])(
    'shows Agent units names and formats metrics when the name column is %s',
    (unitColumn) => {
      const iteration = adaptLivePipelineIterationDetail(
        {
          id: 103,
          pipelineId: 7,
          iterationNumber: 3,
          stages: [
            {
              id: 11,
              stageKey: 'grade',
              name: 'Grade',
              sequence: 1,
              status: 'PASSED',
              sections: [
                {
                  key: 'units',
                  title: 'Agent units',
                  role: 'DETAILS',
                  columns: [
                    ...(unitColumn ? [{ key: unitColumn, label: 'Unit' }] : []),
                    { key: 'duration', label: 'Duration', valueType: 'DURATION' },
                    { key: 'tokens', label: 'Tokens', valueType: 'NUMBER' },
                    { key: 'identifier', label: 'ID', valueType: 'FUTURE_TYPE' },
                  ],
                  rows: [
                    {
                      key: 'first',
                      cells: {
                        unit: { value: 'Review single' },
                        duration: { value: '130721' },
                        tokens: { value: '12500' },
                        identifier: { value: '00123' },
                      },
                    },
                    {
                      key: 'second',
                      cells: { duration: { value: '0' }, tokens: { value: '0' } },
                    },
                    {
                      key: 'third',
                      cells: {
                        name: { value: 'Legacy name' },
                        unit: { value: 'Producer name' },
                        duration: { value: '' },
                        tokens: { value: 'not available' },
                      },
                    },
                    {
                      key: 'fourth',
                      cells: {
                        unit: { value: '   ' },
                        duration: { value: '-5' },
                        tokens: { value: '1234.56789' },
                      },
                    },
                    {
                      key: 'outside-safe-range',
                      cells: { duration: { value: '1e22' }, tokens: { value: '9007199254740993' } },
                    },
                  ],
                },
              ],
            },
          ],
        },
        7,
        103,
      );
      const wrapper = renderTraceDetail(iteration.stages, { iteration });
      const cells = wrapper.find(
        '[data-automation-id="reducedStageDetailSections"] tbody td',
      ) as unknown as TestNodes;

      expect(cells.map((cell) => cell.text())).toEqual([
        'Review single',
        '2m 10s',
        '12,500',
        '00123',
        'second',
        '0s',
        '0',
        '',
        'Legacy name',
        '',
        'not available',
        '',
        'fourth',
        '-5',
        '1,234.56789',
        '',
        'outside-safe-range',
        '1e22',
        '9007199254740993',
        '',
      ]);
      expect(cells.map((cell) => cell.prop('title')).slice(1, 3)).toEqual(['130721', '12500']);
    },
  );

  test('hides Auto-Ready metrics and the Tokens highlight while keeping Ready and stage metadata', () => {
    const autoReadyPromoted = {
      key: 'autoReadyPromoted',
      label: 'Auto-Ready promoted',
      value: '0',
      type: 'META' as const,
    };
    const uploadStage: ReducedPipelineDetailStage = {
      id: 11,
      key: 'upload',
      stageKey: 'upload',
      label: 'Upload',
      sequence: 1,
      status: 'PASSED',
      attributes: [
        autoReadyPromoted,
        { key: 'autoReadyThreshold', label: 'Auto-Ready threshold', value: '90', type: 'NONE' },
        { key: 'tokens', label: 'Tokens', value: '245852', type: 'META' },
      ],
    };
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          pipelineType: 'TEST_CASE_GENERATION',
          attributes: [autoReadyPromoted, { key: 'readyNow', value: '1' }],
          stages: [uploadStage],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    const iteration = wrapper.find('section[aria-label="Iteration summary"]');
    const stageCard = wrapper.find('[data-automation-id="reducedStageCard-11"]');
    const stagePanel = wrapper.find('[data-automation-id="reducedStagePanel"]');
    expect(iteration.text()).not.toContain('Auto-Ready');
    expect(iteration.find('KpiTile').prop('label')).toBe('Ready now');
    expect(stageCard.text()).not.toContain('Auto-Ready');
    expect(stageCard.text()).toContain('Tokens: 245852');
    expect(stagePanel.text()).not.toContain('Auto-Ready');
    expect(stagePanel.find('[data-automation-id="generationStageHighlights"]')).toHaveLength(0);
  });

  test('hides Agent output and Warnings from the iteration summary', () => {
    const wrapper = shallow(
      <ReducedIterationDetails
        iteration={detail({
          attributes: [
            { key: 'agentOutput', value: '```json' },
            { key: 'agent_output', label: 'Agent output', value: '```json' },
            { key: 'warnings', label: 'Warnings', value: '1' },
            { key: 'branch', label: 'Branch', value: 'main' },
          ],
        })}
        hasError={false}
        isUnavailable={false}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={jest.fn()}
      />,
    );

    const attributes = wrapper.find('section[aria-label="Iteration summary"] .attributes');
    expect(attributes.text()).toBe('Branch:main');
  });

  test('shows only the selected stage panel without API diagnostics', () => {
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
    expect(wrapper.text()).not.toContain('Mapped API fields');
    expect(wrapper.text()).not.toContain('Full API response');
    expect(wrapper.text()).not.toContain('"pipelineId": 7');
    expect(wrapper.text()).not.toContain('"backendOnly"');
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

describe('stage retry availability', () => {
  const create: ReducedPipelineDetailStage = {
    id: 41,
    key: 'create',
    stageKey: 'create',
    label: 'Create',
    sequence: 1,
    status: 'FAILED',
    ownedBy: 'PIPELINE',
    retryable: true,
    attempt: 1,
  };

  test('offers separate actions for retryable failed generation Create and Upload stages', () => {
    const stages: ReducedPipelineDetailStage[] = [
      create,
      { ...create, id: 42, key: 'upload', stageKey: 'upload', label: 'Upload', sequence: 2 },
      { ...create, id: 43, key: 'review', stageKey: 'review', label: 'Review', sequence: 3 },
      { ...create, id: 44, ownedBy: 'REPORTPORTAL', sequence: 4 },
      { ...create, id: 45, status: 'PENDING', sequence: 5 },
      { ...create, id: 46, retryable: false, sequence: 6 },
    ];
    const wrapper = renderTraceDetail(stages, {
      projectKey: 'demo',
      canRetryStages: true,
      iteration: detail({ pipelineType: 'TEST_CASE_GENERATION', stages }),
    });

    expect(wrapper.find('button').find(LiveStageRetryAction)).toHaveLength(0);
    const retryStageIds = (wrapper.find(LiveStageRetryAction) as unknown as TestNodes).map(
      (action) => action.prop('stageId') as number,
    );
    expect(retryStageIds).toEqual([41, 42]);
  });

  test.each([false, true])(
    'requires project identity and permission (permission=%s)',
    (canRetryStages) => {
      const wrapper = renderTraceDetail([create], {
        iteration: detail({ pipelineType: 'TEST_CASE_GENERATION', stages: [create] }),
        canRetryStages,
        projectKey: canRetryStages ? undefined : 'demo',
      });
      expect(wrapper.find(LiveStageRetryAction)).toHaveLength(0);
    },
  );
});
