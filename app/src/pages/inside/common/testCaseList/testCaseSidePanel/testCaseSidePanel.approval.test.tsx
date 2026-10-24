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
import { useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { projectKeySelector } from 'controllers/project';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useLiveReviewComments } from 'pages/inside/aiFactory/review/useLiveReviewComments';
import { NativeApproveButton } from 'pages/inside/aiFactory/approval/nativeApproveButton';
import type { ExtendedTestCase } from 'types/testCase';

import { TestCaseSidePanel } from './testCaseSidePanel';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  MeatballMenuIcon: 'MeatballMenuIcon',
  Tooltip: 'Tooltip',
  CopyIcon: 'CopyIcon',
  RerunIcon: 'RerunIcon',
}));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({
    TEST_CASE_LIBRARY_EVENTS: {},
    SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME: {},
    TEST_CASE_MENU_ELEMENT_NAME: {},
    TEST_CASE_PLACE: { SIDE_PANEL: 'SIDE_PANEL' },
  }),
  { virtual: true },
);
jest.mock('html-react-parser', () => ({ __esModule: true, default: () => null }));
jest.mock('react-redux', () => ({ useDispatch: () => jest.fn(), useSelector: jest.fn() }));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string }) => message.defaultMessage ?? '',
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classes: string[]) =>
      classes.join(' '),
  copyToClipboard: jest.fn(),
}));
jest.mock('common/hooks', () => ({ useOnClickOutside: jest.fn() }));
jest.mock('hooks/useHasTestPlans', () => ({ useHasTestPlans: () => ({ hasTestPlans: false }) }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('pages/common/popoverControl', () => ({ PopoverControl: 'PopoverControl' }));
jest.mock('components/collapsibleSection', () => ({ CollapsibleSection: 'CollapsibleSection' }));
jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: 'ExpandedTextSection',
}));
jest.mock('components/folderBreadcrumbs', () => ({ FolderBreadcrumbs: 'FolderBreadcrumbs' }));
jest.mock('pages/inside/common/priorityIcon', () => ({ PriorityIcon: 'PriorityIcon' }));
jest.mock('pages/inside/common/executionEstimationTime', () => ({
  ExecutionEstimationTime: 'ExecutionEstimationTime',
}));
jest.mock('pages/inside/common/attachmentList', () => ({ AttachmentList: 'AttachmentList' }));
jest.mock('pages/inside/productVersionPage/linkedTestCasesTab/tagList', () => ({
  AdaptiveTagList: 'AdaptiveTagList',
}));
jest.mock(
  'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal',
  () => ({ useAddTestCasesToTestPlanModal: () => ({ openModal: jest.fn() }) }),
);
jest.mock('pages/inside/testCaseLibraryPage/createTestCaseModal', () => ({
  useEditTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('pages/inside/testCaseLibraryPage/deleteTestCaseModal', () => ({
  useDeleteTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('pages/inside/testCaseLibraryPage/moveTestCaseModal/useMoveTestCaseModal', () => ({
  useMoveTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('pages/inside/testCaseLibraryPage/duplicateSelectedTestCaseModal', () => ({
  useDuplicateSelectedTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('pages/inside/testCaseLibraryPage/addToLaunchButton', () => ({
  AddToLaunchButtonView: 'AddToLaunchButtonView',
  useAddToLaunchAction: () => ({ onClick: jest.fn() }),
}));
jest.mock('pages/inside/aiFactory/common', () => ({
  AiChip: 'AiChip',
  LifecycleBadge: 'LifecycleBadge',
  ScoreChip: 'ScoreChip',
}));
jest.mock('pages/inside/aiFactory/evaluation', () => ({ EvaluationMini: 'EvaluationMini' }));
jest.mock('pages/inside/aiFactory/library/reviewFlags', () => ({ ReviewFlags: 'ReviewFlags' }));
jest.mock('pages/inside/aiFactory/lifecycle', () => ({ useTestCaseAi: () => ({ data: null }) }));
jest.mock('pages/inside/aiFactory/review/useLiveReviewComments', () => ({
  useLiveReviewComments: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/approval', () => ({
  ApproveButton: 'ApproveButton',
  NativeApproveButton: jest.requireActual<
    typeof import('pages/inside/aiFactory/approval/nativeApproveButton')
  >('pages/inside/aiFactory/approval/nativeApproveButton').NativeApproveButton,
}));
jest.mock('controllers/notification', () => ({
  showSuccessNotification: jest.fn(),
  showErrorNotification: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/common/nativeTestCaseSummary/nativeTestCaseSummary', () => ({
  NativeTestCaseSummary: 'NativeTestCaseSummary',
}));
jest.mock('pages/inside/aiFactory/readyOnlyGate', () => ({
  isDraftGateActive: (enabled: boolean, status: string) => enabled && status === 'DRAFT',
  LaunchBlockedBanner: 'LaunchBlockedBanner',
  readyOnlyMessages: { testPlanDraftHint: { defaultMessage: 'Draft' } },
}));
const mockRefetch = jest.fn();
jest.mock('pages/inside/testCaseLibraryPage/hooks/useRefetchCurrentTestCases', () => ({
  useRefetchCurrentTestCases: () => mockRefetch,
}));
jest.mock('../../requirementsList/requirementsList', () => ({
  RequirementsList: 'RequirementsList',
}));
jest.mock('../utils', () => ({
  formatTimestamp: () => '',
  getExcludedActionsFromPermissionMap: () => [],
}));
jest.mock('../configUtils', () => ({ createTestCaseMenuItems: () => [] }));
jest.mock('./scenario', () => ({ Scenario: 'Scenario' }));

const nativeCase = {
  id: 42,
  displayId: 'TC42',
  name: 'Native case',
  origin: 'AI',
  status: 'DRAFT',
  defaultVersionId: 100,
  priority: 'NORMAL',
  attributes: [],
  manualScenario: {},
  testFolder: { id: 7 },
} as unknown as ExtendedTestCase;
const reviewState = {
  resourceKey: {},
  isLoaded: true,
  isLoading: false,
  isError: false,
  isMutating: false,
  isMutationError: false,
  comments: [],
  unsentCount: 0,
  fixInProgress: false,
  reload: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  discardPending: jest.fn(),
  approveReady: jest.fn(),
};

describe('TestCaseSidePanel native approval', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
    jest
      .mocked(useUserPermissions)
      .mockReturnValue({ canReviewAiTestCases: true, canManageTestCases: true } as ReturnType<
        typeof useUserPermissions
      >);
    jest
      .mocked(useSelector)
      .mockImplementation((selector) =>
        selector === projectKeySelector
          ? 'demo'
          : { organizationSlug: 'org', projectSlug: 'project' },
      );
    jest.mocked(useLiveReviewComments).mockReturnValue(reviewState);
  });

  test('shares its Review state with Approve and refreshes the list after reconciliation', () => {
    const wrapper = shallow(
      <TestCaseSidePanel testCase={nativeCase} isVisible onClose={jest.fn()} />,
    );
    expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, true, {
      canApprove: true,
      versionId: 100,
    });
    const approval = wrapper.find(NativeApproveButton);
    expect(approval.prop('reviewState')).toBe(reviewState);
    (approval.prop('onRefresh') as () => void)();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find('ApproveButton')).toHaveLength(0);
  });

  test.each(['hidden', 'manual', 'ready', 'flag-off', 'viewer'] as const)(
    'does not enable native approval for %s',
    (variant) => {
      if (variant === 'flag-off') jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
      if (variant === 'viewer')
        jest
          .mocked(useUserPermissions)
          .mockReturnValue({ canReviewAiTestCases: false, canManageTestCases: false } as ReturnType<
            typeof useUserPermissions
          >);
      const selected = {
        ...nativeCase,
        ...(variant === 'manual' ? { origin: 'MANUAL' as const } : {}),
        ...(variant === 'ready' ? { status: 'READY' as const } : {}),
      };
      const wrapper = shallow(
        <TestCaseSidePanel
          testCase={selected}
          isVisible={variant !== 'hidden'}
          onClose={jest.fn()}
        />,
      );
      const approval = wrapper.find(NativeApproveButton);
      if (approval.length)
        expect(
          (approval as typeof wrapper & { dive: () => typeof wrapper })
            .dive()
            .find('[data-automation-id="native-test-case-approve"]'),
        ).toHaveLength(0);
      expect(wrapper.find('ApproveButton')).toHaveLength(0);
      expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, expect.any(Boolean), {
        canApprove: variant === 'viewer',
        versionId: 100,
      });
    },
  );
});
