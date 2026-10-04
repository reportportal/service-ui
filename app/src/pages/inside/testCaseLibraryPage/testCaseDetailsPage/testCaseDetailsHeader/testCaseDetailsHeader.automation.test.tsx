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
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PopoverControl } from 'pages/common/popoverControl';
import {
  useAutomationModal,
  type AutomationCandidate,
} from 'pages/inside/aiFactory/automation';
import type { AutomateAcceptedRS } from 'types/aiFactory';
import { Lifecycle } from 'types/aiFactory';
import type { ExtendedTestCase } from 'types/testCase';

import { TestCaseDetailsHeader } from './testCaseDetailsHeader';

jest.mock('@reportportal/ui-kit', () => ({
  BreadcrumbsTreeIcon: 'BreadcrumbsTreeIcon',
  Button: 'Button',
  MeatballMenuIcon: 'MeatballMenuIcon',
  Tooltip: 'Tooltip',
}));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({
    TEST_CASE_LIBRARY_EVENTS: {
      clickEditTestCaseFromDetails: jest.fn(),
      clickTestCaseMenu: jest.fn(),
    },
    TEST_CASE_MENU_ELEMENT_NAME: { DELETE: 'DELETE', DUPLICATE: 'DUPLICATE', HISTORY: 'HISTORY' },
    TEST_CASE_PLACE: { DETAILS_PAGE: 'DETAILS_PAGE' },
  }),
  { virtual: true },
);
jest.mock('html-react-parser', () => ({ __esModule: true, default: () => null }));
jest.mock('react-copy-to-clipboard', () => ({ CopyToClipboard: 'CopyToClipboard' }));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('common/utils', () => ({
  queueReducers:
    jest.requireActual<typeof import('common/utils/queueReducers')>('common/utils/queueReducers')
      .queueReducers,
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('componentLibrary/breadcrumbs', () => ({ Breadcrumbs: 'Breadcrumbs' }), {
  virtual: true,
});
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/modal', () => ({ showModalAction: jest.fn() }));
jest.mock('controllers/pages', () => {
  const {
    createQueryParametersSelector,
    filterIdSelector,
    pagePropertiesSelector,
    pageSelector,
  } = jest.requireActual<typeof import('controllers/pages/selectors')>('controllers/pages/selectors');
  const { payloadSelector } =
    jest.requireActual<typeof import('controllers/pages/typed-selectors')>(
      'controllers/pages/typed-selectors',
    );

  return {
    PROJECT_LAUNCHES_PAGE: 'PROJECT_LAUNCHES_PAGE',
    TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
    createQueryParametersSelector,
    filterIdSelector,
    pagePropertiesSelector,
    pageSelector,
    payloadSelector,
    urlOrganizationAndProjectSelector: jest.fn(),
  };
});
jest.mock('controllers/pages/selectors', () => ({
  ...jest.requireActual<object>('controllers/pages/selectors'),
  testCaseLibraryBreadcrumbsSelector: jest.fn(() => jest.fn()),
}));
jest.mock('controllers/testCase', () => ({ GET_TEST_CASE_DETAILS: 'GET_TEST_CASE_DETAILS' }));
jest.mock('hooks/useHasTestPlans', () => ({
  useHasTestPlans: () => ({ hasTestPlans: false }),
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/common/popoverControl', () => ({ PopoverControl: 'PopoverControl' }));
jest.mock('pages/inside/aiFactory/approval', () => ({ ApproveButton: 'ApproveButton' }));
jest.mock('pages/inside/aiFactory/automation', () => {
  const actual = jest.requireActual<object>('pages/inside/aiFactory/automation');

  return { ...actual, useAutomationModal: jest.fn() };
});
jest.mock('pages/inside/aiFactory/common', () => ({
  LifecycleBadge: 'LifecycleBadge',
  ScoreChip: 'ScoreChip',
}));
jest.mock('pages/inside/common/executionEstimationTime', () => ({
  ExecutionEstimationTime: 'ExecutionEstimationTime',
}));
jest.mock('pages/inside/common/priorityIcon', () => ({ PriorityIcon: 'PriorityIcon' }));
jest.mock('../../addToLaunchButton', () => ({ AddToLaunchButton: 'AddToLaunchButton' }));
jest.mock('../../deleteTestCaseModal', () => ({
  useDeleteTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('../../duplicateSelectedTestCaseModal', () => ({
  useDuplicateSelectedTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('../../editScenarioModal', () => ({
  useEditScenarioModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('../editTestCaseModal/editTestCaseModal', () => ({
  EDIT_TEST_CASE_MODAL_KEY: 'EDIT_TEST_CASE_MODAL_KEY',
}));

const dispatch = jest.fn();
interface AutomationModalData {
  testCases: AutomationCandidate[];
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

interface AutomationMenuItem {
  label: string;
  disabled?: boolean;
  tooltip?: string;
  onClick: () => void;
}

const openAutomationModal = jest.fn<void, [AutomationModalData]>();
const testCase = {
  id: 42,
  displayId: 'TC42',
  name: 'Checkout',
  priority: 'NORMAL',
  createdAt: 1,
  lifecycle: Lifecycle.READY,
  testFolder: { id: 7 },
  manualScenario: {},
  attributes: [],
} as unknown as ExtendedTestCase;

const renderHeader = (
  isEnabled: boolean,
  canAutomateTestCases: boolean,
  selectedTestCase: ExtendedTestCase = testCase,
) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useUserPermissions).mockReturnValue({
    canAutomateTestCases,
    canManageTestCases: false,
    canReviewAiTestCases: false,
  } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useAutomationModal).mockReturnValue({ openModal: openAutomationModal });

  return shallow(
    <TestCaseDetailsHeader
      testCase={selectedTestCase}
      onAddToTestPlan={jest.fn()}
    />,
  );
};

describe('TestCaseDetailsHeader automation action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useDispatch).mockReturnValue(dispatch);
    jest.mocked(useSelector).mockReturnValue({ organizationSlug: 'org', projectSlug: 'project' });
  });

  test('shows the kebab action only when the toggle and permission are enabled', () => {
    expect(renderHeader(false, true).find(PopoverControl)).toHaveLength(0);
    expect(renderHeader(true, false).find(PopoverControl)).toHaveLength(0);

    const items = renderHeader(true, true)
      .find(PopoverControl)
      .prop('items') as AutomationMenuItem[];
    expect(items).toEqual([
      expect.objectContaining({ label: 'Automate', disabled: false, onClick: expect.any(Function) }),
    ]);
  });

  test('opens Automate for a Ready case and refreshes the details after success', () => {
    const item = (
      renderHeader(true, true).find(PopoverControl).prop('items') as AutomationMenuItem[]
    )[0];

    item.onClick();
    expect(openAutomationModal).toHaveBeenCalledWith({
      testCases: [testCase],
      onSuccess: expect.any(Function),
    });

    openAutomationModal.mock.calls[0][0].onSuccess?.({
      iteration: { pipelineId: 2, iterationId: 201, number: 1 },
      accepted: [42],
      skipped: [],
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'GET_TEST_CASE_DETAILS',
      payload: { testCaseId: 42 },
    });
  });

  test('keeps the action disabled with a reason for an ineligible case', () => {
    const item = (
      renderHeader(true, true, {
        ...testCase,
        lifecycle: Lifecycle.DRAFT,
      })
        .find(PopoverControl)
        .prop('items') as AutomationMenuItem[]
    )[0];

    expect(item).toMatchObject({
      label: 'Automate',
      disabled: true,
      tooltip: 'Only Ready Test Cases can be automated',
    });
  });
});
