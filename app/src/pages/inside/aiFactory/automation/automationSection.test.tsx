/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { ReactElement } from 'react';
import { shallow, type ShallowWrapper } from 'enzyme';

import { PROJECT_LAUNCHES_PAGE, PROJECT_PIPELINE_ITERATION_PAGE } from 'controllers/pages';
import { AutomationStatus, Lifecycle, MergeRequestState } from 'types/aiFactory';

import { AutomationSection } from './automationSection';
import { useAutomationModal } from './useAutomationModal';

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: 'BubblesLoader', Button: 'Button' }));
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
jest.mock('common/constants/reservedFilterIds', () => ({ ALL: 'all' }));
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSection: 'CollapsibleSection',
}));
jest.mock('controllers/launch', () => ({ NAMESPACE: 'launches' }));
jest.mock('controllers/pages', () => ({
  PROJECT_LAUNCHES_PAGE: 'PROJECT_LAUNCHES_PAGE',
  PROJECT_PIPELINE_ITERATION_PAGE: 'PROJECT_PIPELINE_ITERATION_PAGE',
}));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('./useAutomationModal', () => ({ useAutomationModal: jest.fn() }));

const openModal = jest.fn();
const testCase = {
  id: 42,
  displayId: 'TC42',
  name: 'Checkout',
  lifecycle: Lifecycle.READY,
};

const renderResults = (wrapper: ShallowWrapper): ShallowWrapper =>
  shallow(
    (
      wrapper as unknown as {
        find: (selector: string) => { getElement: () => ReactElement };
      }
    )
      .find('AutomationResults')
      .getElement(),
  );

describe('AutomationSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAutomationModal).mockReturnValue({ openModal });
  });

  test('opens the modal for an eligible case and forwards the success callback', () => {
    const onSuccess = jest.fn();
    const wrapper = shallow(<AutomationSection testCase={testCase} onSuccess={onSuccess} />);

    (wrapper.find('[data-automation-id="automateTestCase"]').prop('onClick') as () => void)();

    expect(openModal).toHaveBeenCalledWith({ testCases: [testCase], onSuccess });
    expect(wrapper.find('[data-automation-id="automateTestCase"]').prop('disabled')).toBe(false);
  });

  test('disables automation and explains a missing lifecycle fail-safe', () => {
    const wrapper = shallow(<AutomationSection testCase={{ ...testCase, lifecycle: undefined }} />);

    expect(wrapper.find('[data-automation-id="automateTestCase"]').prop('disabled')).toBe(true);
    expect(wrapper.text()).toContain('Only Ready Test Cases can be automated');
  });

  test('renders localized progress with the safe internal iteration route', () => {
    const wrapper = shallow(
      <AutomationSection
        testCase={testCase}
        automation={{
          status: AutomationStatus.IN_PROGRESS,
          iteration: { pipelineId: 7, iterationId: 103, number: 3 },
          scenarioChangedAfterAutomation: false,
        }}
        organizationSlug="my-organization"
        projectSlug="demo"
      />,
    );
    const results = renderResults(wrapper);

    expect(results.find('[data-automation-id="automationProgress"]').text()).toContain(
      'In progress · Iteration #3',
    );
    expect(results.find('[data-automation-id="automationIterationLink"]').prop('to')).toEqual({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug: 'my-organization',
        projectSlug: 'demo',
        pipelineId: 7,
        iterationId: 103,
      },
    });
  });

  test.each([
    [AutomationStatus.NOT_AUTOMATED, 'Not automated'],
    [AutomationStatus.IN_PROGRESS, 'In progress'],
    [AutomationStatus.AUTOMATED, 'Automated'],
    [AutomationStatus.FAILED, 'Failed'],
  ])('renders the %s automation status', (status, label) => {
    const wrapper = shallow(
      <AutomationSection
        testCase={testCase}
        automation={{ status, scenarioChangedAfterAutomation: false }}
      />,
    );

    expect(renderResults(wrapper).find('[data-automation-id="automationStatus"]').text()).toBe(
      label,
    );
  });

  test('keeps terminal results visible for a viewer without rendering the Automate action', () => {
    const wrapper = shallow(
      <AutomationSection
        testCase={testCase}
        automation={{
          status: AutomationStatus.AUTOMATED,
          iteration: { pipelineId: 7, iterationId: 103, number: 3 },
          lastResult: { status: 'PASSED' },
          scenarioChangedAfterAutomation: false,
        }}
        canAutomate={false}
      />,
    );

    expect(renderResults(wrapper).find('[data-automation-id="automationLastResult"]').text()).toBe(
      'Passed',
    );
    expect(wrapper.find('[data-automation-id="automateTestCase"]')).toHaveLength(0);
  });

  test('renders launch, merge request, failed result and scenario-change warning', () => {
    const wrapper = shallow(
      <AutomationSection
        testCase={testCase}
        automation={{
          status: AutomationStatus.FAILED,
          iteration: { pipelineId: 7, iterationId: 103, number: 3 },
          launch: { id: 9001, name: 'RP UI e2e', number: 12 },
          mergeRequest: { id: '!212', state: MergeRequestState.CLOSED },
          lastResult: { status: 'FAILED', defectType: 'Product bug' },
          scenarioChangedAfterAutomation: true,
        }}
        organizationSlug="my-organization"
        projectSlug="demo"
      />,
    );
    const results = renderResults(wrapper);

    expect(results.find('[data-automation-id="automationLaunchLink"]').prop('to')).toEqual({
      type: PROJECT_LAUNCHES_PAGE,
      payload: {
        organizationSlug: 'my-organization',
        projectSlug: 'demo',
        filterId: 'all',
      },
      query: { launchesParams: 'filter.in.id=9001' },
    });
    expect(results.find('[data-automation-id="automationMergeRequest"]').text()).toBe(
      '!212 · Closed',
    );
    expect(results.find('[data-automation-id="automationLastResult"]').text()).toBe(
      'Failed · Defect type: Product bug',
    );
    expect(wrapper.find('[data-automation-id="automationScenarioChanged"]').text()).toBe(
      'Scenario changed after automation',
    );
  });

  test.each([
    {
      name: 'route context is missing',
      iteration: { pipelineId: 7, iterationId: 103, number: 3 },
      launch: { id: 9001, name: 'RP UI e2e', number: 12 },
      organizationSlug: undefined,
      projectSlug: undefined,
    },
    {
      name: 'backend identities are malformed',
      iteration: { pipelineId: 0, iterationId: Number.NaN, number: 3 },
      launch: { id: -1, name: 'RP UI e2e', number: 12 },
      organizationSlug: 'my-organization',
      projectSlug: 'demo',
    },
  ])('renders plain text when $name', (props) => {
    const wrapper = shallow(
      <AutomationSection
        testCase={testCase}
        automation={{
          status: AutomationStatus.AUTOMATED,
          iteration: props.iteration,
          launch: props.launch,
          scenarioChangedAfterAutomation: false,
        }}
        organizationSlug={props.organizationSlug}
        projectSlug={props.projectSlug}
      />,
    );
    const results = renderResults(wrapper);

    expect(results.text()).toContain('Iteration #3');
    expect(results.text()).toContain('RP UI e2e');
    expect(results.find('[data-automation-id="automationIterationLink"]')).toHaveLength(0);
    expect(results.find('[data-automation-id="automationLaunchLink"]')).toHaveLength(0);
  });

  test('renders an accessible initial loading state without unresolved results', () => {
    const wrapper = shallow(<AutomationSection testCase={testCase} isLoading />);

    expect(wrapper.find('AutomationResults')).toHaveLength(0);
    expect(wrapper.find('output').prop('aria-label')).toBe('Loading automation results');
    expect(wrapper.find('BubblesLoader')).toHaveLength(1);
  });

  test('renders an accessible error and invokes retry', () => {
    const onRetry = jest.fn();
    const wrapper = shallow(
      <AutomationSection testCase={testCase} isError onRetry={onRetry} canAutomate={false} />,
    );

    expect(wrapper.find('[role="alert"]').text()).toContain(
      'Automation results could not be loaded. Try again.',
    );
    (
      wrapper.find('[data-automation-id="retryAutomationResults"]').prop('onClick') as () => void
    )();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('retains last-good results while refresh is loading or fails', () => {
    const automation = {
      status: AutomationStatus.AUTOMATED,
      lastResult: { status: 'PASSED' as const },
      scenarioChangedAfterAutomation: false,
    };
    const loadingWrapper = shallow(
      <AutomationSection testCase={testCase} automation={automation} isLoading />,
    );
    const errorWrapper = shallow(
      <AutomationSection testCase={testCase} automation={automation} isError />,
    );

    expect(renderResults(loadingWrapper).text()).toContain('Automated');
    expect(loadingWrapper.find('output').text()).toBe('Updating automation results');
    expect(renderResults(errorWrapper).text()).toContain('Passed');
    expect(errorWrapper.find('[role="alert"]')).toHaveLength(1);
  });
});
