/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow } from 'enzyme';

import { PROJECT_PIPELINE_ITERATION_PAGE } from 'controllers/pages';
import { AutomationStatus, Lifecycle } from 'types/aiFactory';

import { AutomationSection } from './automationSection';
import { useAutomationModal } from './useAutomationModal';

jest.mock('@reportportal/ui-kit', () => ({ Button: 'Button' }));
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
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSection: 'CollapsibleSection',
}));
jest.mock('controllers/pages', () => ({
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

  test('renders localized progress with the internal iteration route', () => {
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

    expect(wrapper.find('[data-automation-id="automationProgress"]').text()).toContain(
      'In progress · Iteration #3',
    );
    expect(wrapper.find('[data-automation-id="automationIterationLink"]').prop('to')).toEqual({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug: 'my-organization',
        projectSlug: 'demo',
        pipelineId: 7,
        iterationId: 103,
      },
    });
  });

  test('keeps progress visible for a viewer without rendering the Automate action', () => {
    const wrapper = shallow(
      <AutomationSection
        testCase={testCase}
        automation={{
          status: AutomationStatus.IN_PROGRESS,
          iteration: { pipelineId: 7, iterationId: 103, number: 3 },
          scenarioChangedAfterAutomation: false,
        }}
        canAutomate={false}
      />,
    );

    expect(wrapper.find('[data-automation-id="automationProgress"]')).toHaveLength(1);
    expect(wrapper.find('[data-automation-id="automateTestCase"]')).toHaveLength(0);
  });
});
