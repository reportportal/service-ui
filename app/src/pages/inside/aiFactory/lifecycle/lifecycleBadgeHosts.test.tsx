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
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { useHasTestPlans } from 'hooks/useHasTestPlans';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { AiChip, LifecycleBadge, ScoreChip } from 'pages/inside/aiFactory/common';
import { EvaluationMini } from 'pages/inside/aiFactory/evaluation';
import { ApproveButton } from 'pages/inside/aiFactory/approval';
import { ReviewFlags } from 'pages/inside/aiFactory/library/reviewFlags';
import { LaunchBlockedBanner } from 'pages/inside/aiFactory/readyOnlyGate';
import { useDeleteTestCaseModal } from 'pages/inside/testCaseLibraryPage/deleteTestCaseModal';
import { useDuplicateSelectedTestCaseModal } from 'pages/inside/testCaseLibraryPage/duplicateSelectedTestCaseModal';
import { useEditScenarioModal } from 'pages/inside/testCaseLibraryPage/editScenarioModal';
import { useAddTestCasesToTestPlanModal } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useEditTestCaseModal } from 'pages/inside/testCaseLibraryPage/createTestCaseModal';
import { useMoveTestCaseModal } from 'pages/inside/testCaseLibraryPage/moveTestCaseModal/useMoveTestCaseModal';
import { TestCaseSidePanel } from 'pages/inside/common/testCaseList/testCaseSidePanel';
import { TestCaseDetailsHeader } from 'pages/inside/testCaseLibraryPage/testCaseDetailsPage/testCaseDetailsHeader';
import { EvaluationState, Lifecycle } from 'types/aiFactory';
import { TestCaseManualScenario, type ExtendedTestCase } from 'types/testCase';

jest.mock('@reportportal/ui-kit', () => ({
  BreadcrumbsTreeIcon: 'BreadcrumbsTreeIcon',
  Button: 'Button',
  CopyIcon: 'CopyIcon',
  MeatballMenuIcon: 'MeatballMenuIcon',
  RerunIcon: 'RerunIcon',
  SystemMessage: 'SystemMessage',
  Tooltip: 'Tooltip',
}));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({
    SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME: {
      OPEN_DETAILS: 'OPEN_DETAILS',
      ADD_TO_TEST_PLAN: 'ADD_TO_TEST_PLAN',
    },
    TEST_CASE_LIBRARY_EVENTS: {
      clickEditTestCaseFromDetails: jest.fn(),
      clickSidePanelMenu: jest.fn(),
      clickSidePanelQuickAction: jest.fn(),
      clickTestCaseMenu: jest.fn(),
    },
    TEST_CASE_MENU_ELEMENT_NAME: {
      DELETE: 'DELETE',
      DUPLICATE: 'DUPLICATE',
      EDIT: 'EDIT',
      HISTORY: 'HISTORY',
      MOVE_TO: 'MOVE_TO',
    },
    TEST_CASE_PLACE: { DETAILS_PAGE: 'DETAILS_PAGE' },
  }),
  { virtual: true },
);
jest.mock('html-react-parser', () => ({ __esModule: true, default: () => null }));
jest.mock('moment', () => ({ __esModule: true, default: () => ({ format: () => '' }) }));
jest.mock('react-copy-to-clipboard', () => ({ CopyToClipboard: 'CopyToClipboard' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('common/hooks', () => ({ useOnClickOutside: jest.fn() }));
jest.mock('common/utils', () => ({
  copyToClipboard: jest.fn(() => Promise.resolve()),
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/collapsibleSection', () => ({ CollapsibleSection: 'CollapsibleSection' }));
jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: 'ExpandedTextSection',
}));
jest.mock('components/folderBreadcrumbs', () => ({ FolderBreadcrumbs: 'FolderBreadcrumbs' }));
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
  testCaseLibraryBreadcrumbsSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/testCase', () => ({ GET_TEST_CASE_DETAILS: 'GET_TEST_CASE_DETAILS' }));
jest.mock('hooks/useHasTestPlans', () => ({ useHasTestPlans: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/common/popoverControl', () => ({ PopoverControl: 'PopoverControl' }));
jest.mock('pages/common/popoverControl/popoverControl', () => ({}));
jest.mock('pages/inside/common/attachmentList', () => ({ AttachmentList: 'AttachmentList' }));
jest.mock('pages/inside/common/executionEstimationTime', () => ({
  ExecutionEstimationTime: 'ExecutionEstimationTime',
}));
jest.mock('pages/inside/common/priorityIcon', () => ({ PriorityIcon: 'PriorityIcon' }));
jest.mock('pages/inside/common/requirementsList/requirementsList', () => ({
  RequirementsList: 'RequirementsList',
}));
jest.mock('pages/inside/productVersionPage/linkedTestCasesTab/tagList', () => ({
  AdaptiveTagList: 'AdaptiveTagList',
}));
jest.mock('pages/inside/testCaseLibraryPage/addToLaunchButton', () => ({
  AddToLaunchButton: 'AddToLaunchButton',
}));
jest.mock(
  'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal',
  () => ({ useAddTestCasesToTestPlanModal: jest.fn() }),
);
jest.mock('pages/inside/testCaseLibraryPage/createTestCaseModal', () => ({
  useEditTestCaseModal: jest.fn(),
}));
jest.mock('pages/inside/testCaseLibraryPage/deleteTestCaseModal', () => ({
  useDeleteTestCaseModal: jest.fn(),
}));
jest.mock('pages/inside/testCaseLibraryPage/duplicateSelectedTestCaseModal', () => ({
  useDuplicateSelectedTestCaseModal: jest.fn(),
}));
jest.mock('pages/inside/testCaseLibraryPage/editScenarioModal', () => ({
  useEditScenarioModal: jest.fn(),
}));
jest.mock(
  'pages/inside/testCaseLibraryPage/testCaseDetailsPage/editTestCaseModal/editTestCaseModal',
  () => ({ EDIT_TEST_CASE_MODAL_KEY: 'EDIT_TEST_CASE_MODAL_KEY' }),
);
jest.mock('pages/inside/testCaseLibraryPage/moveTestCaseModal/useMoveTestCaseModal', () => ({
  useMoveTestCaseModal: jest.fn(),
}));
jest.mock('pages/inside/common/testCaseList/configUtils', () => ({
  createTestCaseMenuItems: jest.fn(() => []),
}));
jest.mock('pages/inside/common/testCaseList/utils', () => ({
  formatTimestamp: jest.fn(() => ''),
  getExcludedActionsFromPermissionMap: jest.fn(() => []),
}));
jest.mock('pages/inside/common/testCaseList/testCaseSidePanel/scenario', () => ({
  Scenario: 'Scenario',
}));
jest.mock('pages/inside/aiFactory/evaluation', () => ({ EvaluationMini: 'EvaluationMini' }));
jest.mock('pages/inside/aiFactory/approval', () => ({ ApproveButton: 'ApproveButton' }));
jest.mock('pages/inside/aiFactory/lifecycle', () => ({
  useTestCaseAi: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    reload: jest.fn(),
  })),
}));
jest.mock('pages/inside/testCaseLibraryPage/hooks/useRefetchCurrentTestCases', () => ({
  useRefetchCurrentTestCases: jest.fn(() => jest.fn()),
}));

const openModal = jest.fn();
const testCase = {
  id: 42,
  displayId: 'TC42',
  name: 'Lifecycle case',
  priority: 'normal',
  createdAt: 1,
  description: '',
  attributes: [],
  testFolder: { id: 7 },
  lifecycle: Lifecycle.READY,
  ai: {
    generatedByIteration: { pipelineId: 17, iterationId: 103, number: 4 },
    modifiedByAgent: false,
    factoryKey: 'spec::case',
  },
  evaluationSummary: { totalScore: 82, state: EvaluationState.EVALUATED },
  review: { unsentCommentsCount: 1 },
  manualScenario: {
    manualScenarioType: TestCaseManualScenario.TEXT,
    attachments: [],
    requirements: [],
  },
} as unknown as ExtendedTestCase;

const renderHosts = (
  isEnabled: boolean,
  caseToRender: ExtendedTestCase = testCase,
  canReviewAiTestCases = false,
  canManageTestCases = false,
  hasTestPlans = false,
) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useDispatch).mockReturnValue(jest.fn());
  jest.mocked(useSelector).mockReturnValue({ organizationSlug: 'org', projectSlug: 'project' });
  jest.mocked(useUserPermissions).mockReturnValue({
    canManageTestCases,
    canReviewAiTestCases,
  } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useHasTestPlans).mockReturnValue({
    hasTestPlans,
    isCheckingTestPlansExistence: false,
  });
  jest.mocked(useDeleteTestCaseModal).mockReturnValue({ openModal });
  jest.mocked(useDuplicateSelectedTestCaseModal).mockReturnValue({ openModal });
  jest.mocked(useEditScenarioModal).mockReturnValue({ openModal });
  jest.mocked(useEditTestCaseModal).mockReturnValue({ openModal });
  jest.mocked(useMoveTestCaseModal).mockReturnValue({ openModal });
  jest.mocked(useAddTestCasesToTestPlanModal).mockReturnValue({ openModal });

  return {
    header: shallow(<TestCaseDetailsHeader testCase={caseToRender} onAddToTestPlan={jest.fn()} />),
    sidePanel: shallow(<TestCaseSidePanel testCase={caseToRender} isVisible onClose={jest.fn()} />),
  };
};

describe('lifecycle badges in test case hosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    { isEnabled: false, expectedCount: 0 },
    { isEnabled: true, expectedCount: 1 },
  ])('renders badges only when feature enabled is $isEnabled', ({ isEnabled, expectedCount }) => {
    const { header, sidePanel } = renderHosts(isEnabled);

    expect(header.find(LifecycleBadge)).toHaveLength(expectedCount);
    expect(sidePanel.find(LifecycleBadge)).toHaveLength(expectedCount);
  });

  test.each([
    { isEnabled: false, expectedCount: 0 },
    { isEnabled: true, expectedCount: 1 },
  ])(
    'renders the header score only when feature enabled is $isEnabled',
    ({ isEnabled, expectedCount }) => {
      const { header } = renderHosts(isEnabled);

      expect(header.find(ScoreChip)).toHaveLength(expectedCount);
    },
  );

  test('renders the AI side-panel summary and mini evaluation only when enabled', () => {
    const enabledPanel = renderHosts(true).sidePanel;
    const disabledPanel = renderHosts(false).sidePanel;

    expect(enabledPanel.find('[data-automation-id="ai-status-row"]')).toHaveLength(1);
    expect(enabledPanel.find(AiChip)).toHaveLength(1);
    expect(enabledPanel.find(ScoreChip)).toHaveLength(1);
    expect(enabledPanel.find(ReviewFlags)).toHaveLength(1);
    expect(enabledPanel.find(EvaluationMini)).toHaveLength(1);
    expect(disabledPanel.find('[data-automation-id="ai-status-row"]')).toHaveLength(0);
    expect(disabledPanel.find(EvaluationMini)).toHaveLength(0);
  });

  test('renders approval in both hosts only for a permitted Draft case', () => {
    const draftCase = { ...testCase, lifecycle: Lifecycle.DRAFT };
    const permitted = renderHosts(true, draftCase, true);
    const viewer = renderHosts(true, draftCase, false);
    const toggleOff = renderHosts(false, draftCase, true);

    expect(permitted.header.find(ApproveButton)).toHaveLength(1);
    expect(permitted.sidePanel.find(ApproveButton)).toHaveLength(1);
    expect(viewer.header.find(ApproveButton)).toHaveLength(0);
    expect(viewer.sidePanel.find(ApproveButton)).toHaveLength(0);
    expect(toggleOff.header.find(ApproveButton)).toHaveLength(0);
    expect(toggleOff.sidePanel.find(ApproveButton)).toHaveLength(0);
  });

  test('gates Test Plan actions and shows the blocked-plan banner for a planned Draft case', () => {
    const draftCase = {
      ...testCase,
      lifecycle: Lifecycle.DRAFT,
      blockedPlans: [{ id: 7, name: 'Release regression' }],
    };
    const { header, sidePanel } = renderHosts(true, draftCase, false, true, true);

    const readyOnlyTooltip = {
      content: 'Only Ready Test Cases can be added to a Test Plan',
    };

    expect(header.find(readyOnlyTooltip)).toHaveLength(1);
    expect(sidePanel.find(readyOnlyTooltip)).toHaveLength(1);
    expect(sidePanel.find(LaunchBlockedBanner).prop('plans')).toEqual(draftCase.blockedPlans);
  });

  test('keeps the closed side panel safe when no Test Case is selected', () => {
    renderHosts(true);

    const wrapper = shallow(
      <TestCaseSidePanel testCase={null} isVisible={false} onClose={jest.fn()} />,
    );

    expect(wrapper.html()).toBeNull();
  });
});
