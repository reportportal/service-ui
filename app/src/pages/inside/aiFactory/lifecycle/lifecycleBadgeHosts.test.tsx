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

import { mount, shallow } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { useHasTestPlans } from 'hooks/useHasTestPlans';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { fetch } from 'common/utils';
import { AiChip, LifecycleBadge, ScoreChip } from 'pages/inside/aiFactory/common';
import { NativeTestCaseSummary } from 'pages/inside/aiFactory/common/nativeTestCaseSummary/nativeTestCaseSummary';
import { useTestCaseAi } from 'pages/inside/aiFactory/lifecycle';
import { EvaluationMini } from 'pages/inside/aiFactory/evaluation';
import { ApproveButton, NativeApproveButton } from 'pages/inside/aiFactory/approval';
import { ReviewFlags } from 'pages/inside/aiFactory/library/reviewFlags';
import { LaunchBlockedBanner } from 'pages/inside/aiFactory/readyOnlyGate';
import { useDeleteTestCaseModal } from 'pages/inside/testCaseLibraryPage/deleteTestCaseModal';
import { useDuplicateSelectedTestCaseModal } from 'pages/inside/testCaseLibraryPage/duplicateSelectedTestCaseModal';
import { useEditScenarioModal } from 'pages/inside/testCaseLibraryPage/editScenarioModal';
import {
  AddToLaunchButtonView,
  useAddToLaunchAction,
} from 'pages/inside/testCaseLibraryPage/addToLaunchButton';
import { useAddTestCasesToTestPlanModal } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useEditTestCaseModal } from 'pages/inside/testCaseLibraryPage/createTestCaseModal';
import { useMoveTestCaseModal } from 'pages/inside/testCaseLibraryPage/moveTestCaseModal/useMoveTestCaseModal';
import { TestCaseSidePanel } from 'pages/inside/common/testCaseList/testCaseSidePanel';
import { TestCaseDetailsHeader } from 'pages/inside/testCaseLibraryPage/testCaseDetailsPage/testCaseDetailsHeader';
import { EvaluationState, Lifecycle } from 'types/aiFactory';
import { TestCaseManualScenario, type ExtendedTestCase } from 'types/testCase';

jest.mock('@reportportal/ui-kit', () => ({
  BreadcrumbsTreeIcon: 'mock-BreadcrumbsTreeIcon',
  Button: 'mock-Button',
  CopyIcon: 'mock-CopyIcon',
  MeatballMenuIcon: 'mock-MeatballMenuIcon',
  RerunIcon: 'mock-RerunIcon',
  SystemMessage: 'mock-SystemMessage',
  Tooltip: 'mock-Tooltip',
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
      DELETE: 'mock-DELETE',
      DUPLICATE: 'mock-DUPLICATE',
      EDIT: 'mock-EDIT',
      HISTORY: 'mock-HISTORY',
      MOVE_TO: 'MOVE_TO',
    },
    TEST_CASE_PLACE: { DETAILS_PAGE: 'DETAILS_PAGE', SIDE_PANEL: 'SIDE_PANEL' },
  }),
  { virtual: true },
);
jest.mock('html-react-parser', () => ({ __esModule: true, default: () => null }));
jest.mock('moment', () => ({ __esModule: true, default: () => ({ format: () => '' }) }));
jest.mock('react-copy-to-clipboard', () => ({ CopyToClipboard: 'mock-CopyToClipboard' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'mock-Link');
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('common/hooks', () => ({ useOnClickOutside: jest.fn() }));
jest.mock('common/utils', () => ({
  fetch: jest.fn(),
  copyToClipboard: jest.fn(() => Promise.resolve()),
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSection: 'mock-CollapsibleSection',
}));
jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: 'mock-ExpandedTextSection',
}));
jest.mock('components/folderBreadcrumbs', () => ({ FolderBreadcrumbs: 'mock-FolderBreadcrumbs' }));
jest.mock('componentLibrary/breadcrumbs', () => ({ Breadcrumbs: 'mock-Breadcrumbs' }), {
  virtual: true,
});
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/modal', () => ({ showModalAction: jest.fn() }));
jest.mock('controllers/pages', () => {
  const { launchPageControllerMock } = jest.requireActual<
    typeof import('pages/inside/aiFactory/testUtils/launchPageControllerMock')
  >('pages/inside/aiFactory/testUtils/launchPageControllerMock');

  return {
    ...launchPageControllerMock,
    TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
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
jest.mock('pages/common/popoverControl', () => ({ PopoverControl: 'mock-PopoverControl' }));
jest.mock('pages/common/popoverControl/popoverControl', () => ({}));
jest.mock('pages/inside/common/attachmentList', () => ({ AttachmentList: 'mock-AttachmentList' }));
jest.mock('pages/inside/common/executionEstimationTime', () => ({
  ExecutionEstimationTime: 'mock-ExecutionEstimationTime',
}));
jest.mock('pages/inside/common/priorityIcon', () => ({ PriorityIcon: 'mock-PriorityIcon' }));
jest.mock('pages/inside/common/requirementsList/requirementsList', () => ({
  RequirementsList: 'mock-RequirementsList',
}));
jest.mock('pages/inside/productVersionPage/linkedTestCasesTab/tagList', () => ({
  AdaptiveTagList: 'mock-AdaptiveTagList',
}));
jest.mock('pages/inside/testCaseLibraryPage/addToLaunchButton', () => ({
  AddToLaunchButton: 'mock-AddToLaunchButton',
  AddToLaunchButtonView: 'mock-AddToLaunchButtonView',
  useAddToLaunchAction: jest.fn(),
}));
jest.mock('pages/inside/testCaseLibraryPage/addToLaunchModal', () => ({
  useAddToLaunchModal: () => ({ openModal: jest.fn() }),
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
  Scenario: 'mock-Scenario',
}));
jest.mock('pages/inside/aiFactory/evaluation', () => ({ EvaluationMini: 'mock-EvaluationMini' }));
jest.mock('pages/inside/aiFactory/common/nativeTestCaseSummary/nativeTestCaseSummary', () => ({
  NativeTestCaseSummary: 'mock-NativeTestCaseSummary',
}));
jest.mock('pages/inside/aiFactory/approval', () => ({
  ApproveButton: 'mock-ApproveButton',
  NativeApproveButton: 'mock-NativeApproveButton',
}));
// Review requests are covered separately; this suite isolates badge hosts and AI details reads.
jest.mock('pages/inside/aiFactory/review/useLiveReviewComments', () => ({
  useLiveReviewComments: () => ({
    resourceKey: {},
    comments: [],
    unsentCount: 0,
    fixInProgress: false,
    isLoaded: true,
    isLoading: false,
    isError: false,
    isMutating: false,
    isMutationError: false,
    reload: jest.fn(),
    addComment: jest.fn(() => Promise.resolve(false)),
    deleteComment: jest.fn(() => Promise.resolve(false)),
    discardPending: jest.fn(() => Promise.resolve(false)),
  }),
}));
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
  canAutomateTestCases = false,
) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useDispatch).mockReturnValue(jest.fn());
  jest.mocked(useSelector).mockReturnValue({ organizationSlug: 'org', projectSlug: 'project' });
  jest.mocked(useUserPermissions).mockReturnValue({
    canManageTestCases,
    canReviewAiTestCases,
    canAutomateTestCases,
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
  jest.mocked(useAddToLaunchAction).mockReturnValue({
    label: 'Add to Launch',
    isDisabled: false,
    onClick: jest.fn(),
  });

  return {
    header: shallow(<TestCaseDetailsHeader testCase={caseToRender} onAddToTestPlan={jest.fn()} />),
    sidePanel: shallow(<TestCaseSidePanel testCase={caseToRender} isVisible onClose={jest.fn()} />),
  };
};

const getHeaderApproval = (header: ReturnType<typeof shallow>) =>
  (header.find('TestCaseApproval') as typeof header & { dive: () => typeof header }).dive();

describe('lifecycle badges in test case hosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTestCaseAi).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      reload: jest.fn(),
    });
  });

  test('keeps native Draft Test Plan actions disabled in the header and side panel', () => {
    const nativeDraft: ExtendedTestCase = {
      ...testCase,
      origin: 'AI',
      status: 'DRAFT',
      lifecycle: Lifecycle.READY,
    };
    const { header, sidePanel } = renderHosts(true, nativeDraft, true, true, true);

    expect(
      header.find({ content: 'Only Ready Test Cases can be added to a Test Plan' }),
    ).toHaveLength(1);
    expect(
      sidePanel.find({ content: 'Only Ready Test Cases can be added to a Test Plan' }),
    ).toHaveLength(1);
  });

  test('keeps native Draft Add to Launch disabled in the header and side panel', () => {
    const nativeDraft = {
      ...testCase,
      origin: 'AI',
      status: 'DRAFT',
      lifecycle: Lifecycle.READY,
      manualScenario: {
        manualScenarioType: TestCaseManualScenario.TEXT,
        instructions: 'Open Library',
        expectedResult: 'Library is displayed',
        attachments: [],
        requirements: [],
      },
    } as ExtendedTestCase;
    const { header, sidePanel } = renderHosts(true, nativeDraft, true, true, true);
    jest
      .mocked(useAddToLaunchAction)
      .mockImplementation(
        jest.requireActual<
          typeof import('pages/inside/testCaseLibraryPage/addToLaunchButton/useAddToLaunchAction')
        >('pages/inside/testCaseLibraryPage/addToLaunchButton/useAddToLaunchAction')
          .useAddToLaunchAction,
      );
    const ActualAddToLaunchButton = jest.requireActual<
      typeof import('pages/inside/testCaseLibraryPage/addToLaunchButton/addToLaunchButton')
    >('pages/inside/testCaseLibraryPage/addToLaunchButton/addToLaunchButton').AddToLaunchButton;
    const launchProps = header.find('mock-AddToLaunchButton').props() as unknown as React.ComponentProps<
      typeof ActualAddToLaunchButton
    >;

    const launchButton = shallow(<ActualAddToLaunchButton {...launchProps} />);
    sidePanel.setProps({ testCase: { ...nativeDraft } });

    expect(
      launchButton.find('[data-automation-id="test-case-add-to-launch"]').prop('disabled'),
    ).toBe(true);
    expect(sidePanel.find(AddToLaunchButtonView).prop('isDisabled')).toBe(true);
  });

  test.each([
    { origin: 'AI', status: 'DRAFT' },
    { origin: 'MANUAL', status: 'READY' },
  ] as const)(
    'shows native $origin/$status identity without legacy actions or provenance',
    ({ origin, status }) => {
      const nativeCase = {
        ...testCase,
        origin,
        status,
        metrics: { overallScore: 0, obsolete: true, costUsd: 0 },
      };
      const { header, sidePanel } = renderHosts(true, nativeCase, true, true, false, true);

      expect(header.find(NativeTestCaseSummary).props()).toMatchObject({
        showIdentity: true,
        showMetrics: false,
        summary: { isAi: origin === 'AI', status },
      });
      expect(sidePanel.find(NativeTestCaseSummary).props()).toMatchObject({
        showIdentity: true,
        summary: { isAi: origin === 'AI', status },
      });
      expect(getHeaderApproval(header).find(ApproveButton)).toHaveLength(0);
      expect(getHeaderApproval(header).find(NativeApproveButton).prop('testCase')).toMatchObject({
        origin,
        status,
      });
      expect(sidePanel.find(NativeApproveButton)).toHaveLength(origin === 'AI' ? 1 : 0);
      expect(header.find('mock-PopoverControl').prop('items')).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ label: 'Automate' })]),
      );
      expect(sidePanel.find(ApproveButton)).toHaveLength(0);
      expect(sidePanel.find(ReviewFlags)).toHaveLength(0);
      expect(sidePanel.find(EvaluationMini)).toHaveLength(0);
      expect(sidePanel.find(LaunchBlockedBanner)).toHaveLength(0);
      expect(sidePanel.find(ScoreChip)).toHaveLength(0);
      expect(header.find(ScoreChip)).toHaveLength(origin === 'AI' ? 1 : 0);
      if (origin === 'AI')
        expect(header.find(ScoreChip).props()).toMatchObject({ score: 0, obsolete: true });
      expect(useTestCaseAi).toHaveBeenLastCalledWith(expect.anything(), 42, false, undefined);
    },
  );

  test('mounts a native side panel without issuing an AI details request', () => {
    const nativeCase = { ...testCase, origin: 'AI', status: 'DRAFT' } as ExtendedTestCase;
    renderHosts(true, nativeCase, true, true);
    jest
      .mocked(useTestCaseAi)
      .mockImplementation(
        jest.requireActual<typeof import('pages/inside/aiFactory/lifecycle/useTestCaseAi')>(
          'pages/inside/aiFactory/lifecycle/useTestCaseAi',
        ).useTestCaseAi,
      );

    const sidePanel = mount(
      <TestCaseSidePanel testCase={nativeCase} isVisible onClose={jest.fn()} />,
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(sidePanel.find(ApproveButton)).toHaveLength(0);
    expect(sidePanel.find(NativeApproveButton)).toHaveLength(1);
    expect(sidePanel.find(EvaluationMini)).toHaveLength(0);
    sidePanel.unmount();
  });

  test('keeps native identity hidden in both hosts while the feature is disabled', () => {
    const nativeCase = { ...testCase, origin: 'AI', status: 'DRAFT' } as ExtendedTestCase;
    const { header, sidePanel } = renderHosts(false, nativeCase, true, true);

    expect(header.find(NativeTestCaseSummary)).toHaveLength(0);
    expect(sidePanel.find(NativeTestCaseSummary)).toHaveLength(0);
    expect(getHeaderApproval(header).find(ApproveButton)).toHaveLength(0);
    expect(getHeaderApproval(header).find(NativeApproveButton)).toHaveLength(0);
    expect(sidePanel.find(ApproveButton)).toHaveLength(0);
    expect(sidePanel.find(NativeApproveButton)).toHaveLength(0);
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

    expect(getHeaderApproval(permitted.header).find(ApproveButton)).toHaveLength(1);
    expect(permitted.sidePanel.find(ApproveButton)).toHaveLength(1);
    expect(getHeaderApproval(viewer.header).find(ApproveButton)).toHaveLength(0);
    expect(viewer.sidePanel.find(ApproveButton)).toHaveLength(0);
    expect(getHeaderApproval(toggleOff.header).find(ApproveButton)).toHaveLength(0);
    expect(toggleOff.sidePanel.find(ApproveButton)).toHaveLength(0);
  });

  test.each([
    { origin: 'AI', status: 'READY', canReview: true },
    { origin: 'MANUAL', status: 'DRAFT', canReview: true },
    { origin: 'AI', status: 'DRAFT', canReview: false },
  ] as const)(
    'keeps side-panel native approval hidden for $origin/$status (reviewer=$canReview)',
    ({ origin, status, canReview }) => {
      const nativeCase = { ...testCase, origin, status };
      const { header, sidePanel } = renderHosts(true, nativeCase, canReview);

      expect(sidePanel.find(NativeApproveButton)).toHaveLength(0);
      expect(sidePanel.find(ApproveButton)).toHaveLength(0);
      expect(getHeaderApproval(header).find(ApproveButton)).toHaveLength(0);
    },
  );

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

  test('exposes accessible side-panel actions and reuses Add to Launch in the narrow menu', () => {
    const { sidePanel } = renderHosts(true, testCase, false, true);
    const moreActions = sidePanel.find('[data-automation-id="test-case-more-actions"]');
    const menuItems = sidePanel.find('mock-PopoverControl').prop('items') as Array<{
      label: string;
      className?: string;
      disabled?: boolean;
      onClick?: () => void;
    }>;

    expect(moreActions.props()).toMatchObject({
      'aria-label': 'More actions',
      'aria-expanded': false,
    });
    expect(moreActions.prop('aria-haspopup')).toBeUndefined();
    expect(menuItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Add to Launch', disabled: false }),
      ]),
    );
    expect(sidePanel.find(AddToLaunchButtonView)).toHaveLength(1);
  });

  test('keeps the closed side panel safe when no Test Case is selected', () => {
    renderHosts(true);

    const wrapper = shallow(
      <TestCaseSidePanel testCase={null} isVisible={false} onClose={jest.fn()} />,
    );

    expect(wrapper.html()).toBeNull();
  });
});
