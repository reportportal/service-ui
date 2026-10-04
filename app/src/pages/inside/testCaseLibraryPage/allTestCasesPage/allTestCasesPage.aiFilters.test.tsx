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
import {
  locationQuerySelector,
  payloadSelector,
  urlFolderIdSelector,
} from 'controllers/pages';
import { foldersSelector } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useHasTestPlans } from 'hooks/useHasTestPlans';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { QuickFilters, useIterationNumber } from 'pages/inside/aiFactory/library';
import { BulkApproveButton } from 'pages/inside/aiFactory/approval';
import {
  useAutomationModal,
  type AutomationCandidate,
} from 'pages/inside/aiFactory/automation';
import type { AutomateAcceptedRS } from 'types/aiFactory';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestCaseList } from 'pages/inside/common/testCaseList';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';
import { Lifecycle } from 'types/aiFactory';
import type { TestCase } from 'types/testCase';

import { useAddToLaunchModal } from '../addToLaunchModal';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { FolderEmptyState } from '../emptyState/folder/folderEmptyState';
import { useMoveTestCaseModal } from '../moveTestCaseModal';
import { useRefetchCurrentTestCases } from '../hooks/useRefetchCurrentTestCases';
import { useBatchDeleteTestCasesModal } from './batchDeleteTestCasesModal';
import { useBatchDuplicateTestCasesModal } from './batchDuplicateTestCasesModal';
import { useBatchEditTagsModal } from './batchEditTagsModal';
import { AllTestCasesPage } from './allTestCasesPage';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  MeatballMenuIcon: 'MeatballMenuIcon',
  Pagination: 'Pagination',
  Selection: 'Selection',
  Tooltip: 'Tooltip',
}));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({
    TEST_CASE_BULK_OPERATION_ELEMENT_NAME: {},
    TEST_CASE_LIBRARY_EVENTS: { clickBulkOperation: jest.fn() },
  }),
  { virtual: true },
);
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage?: string; id?: string },
      values?: Record<string, unknown>,
    ) => {
      const cases = values?.cases;
      return (message.defaultMessage ?? message.id ?? '').replace(
        '{cases}',
        typeof cases === 'string' ? cases : '{cases}',
      );
    },
  }),
}));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: unknown[]) =>
    classNames
      .filter((className): className is string => typeof className === 'string' && !!className)
      .join(' '),
}));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/modal', () => ({ showModalAction: jest.fn() }));
jest.mock('controllers/notification', () => ({
  showWarningNotification: (payload: unknown) => ({ type: 'WARNING', payload }),
}));
jest.mock('controllers/pages', () => ({
  locationQuerySelector: jest.fn(),
  payloadSelector: jest.fn(),
  updatePagePropertiesAction: (payload: unknown) => ({ type: 'updatePagePropertiesAction', payload }),
  urlFolderIdSelector: jest.fn(),
}));
jest.mock('controllers/testCase', () => ({ foldersSelector: jest.fn() }));
jest.mock('hooks/useHasTestPlans', () => ({ useHasTestPlans: jest.fn() }));
jest.mock('hooks/useTypedSelector', () => ({ useProjectDetails: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/common/popoverControl/popoverControl', () => ({
  PopoverControl: 'PopoverControl',
}));
jest.mock('pages/inside/aiFactory/library', () => ({
  QuickFilters: 'QuickFilters',
  useIterationNumber: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/approval', () => ({
  BulkApproveButton: 'BulkApproveButton',
}));
jest.mock('pages/inside/aiFactory/automation', () => {
  const actual = jest.requireActual<object>('pages/inside/aiFactory/automation');

  return { ...actual, useAutomationModal: jest.fn() };
});
jest.mock('pages/inside/common/testCaseList', () => ({ TestCaseList: 'TestCaseList' }));
jest.mock('pages/inside/common/testCaseList/useURLBoundPagination', () => ({
  useURLBoundPagination: jest.fn(),
}));
jest.mock('../addToLaunchModal', () => ({ useAddToLaunchModal: jest.fn() }));
jest.mock('../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal', () => ({
  useAddTestCasesToTestPlanModal: jest.fn(),
}));
jest.mock('../emptyState/folder/folderEmptyState', () => ({
  FolderEmptyState: 'FolderEmptyState',
}));
jest.mock('../moveTestCaseModal', () => ({ useMoveTestCaseModal: jest.fn() }));
jest.mock('../hooks/useRefetchCurrentTestCases', () => ({
  useRefetchCurrentTestCases: jest.fn(),
}));
jest.mock('./batchDeleteTestCasesModal', () => ({ useBatchDeleteTestCasesModal: jest.fn() }));
jest.mock('./batchDuplicateTestCasesModal', () => ({
  useBatchDuplicateTestCasesModal: jest.fn(),
}));
jest.mock('./batchEditTagsModal', () => ({ useBatchEditTagsModal: jest.fn() }));
jest.mock('./changePriorityModal', () => ({ CHANGE_PRIORITY_MODAL_KEY: 'changePriorityModal' }));

const dispatch = jest.fn();
const openAddToLaunchModal = jest.fn();
const openAddToTestPlanModal = jest.fn();
interface AutomationModalData {
  testCases: AutomationCandidate[];
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

const openAutomationModal = jest.fn<void, [AutomationModalData]>();
const refetchCurrentTestCases = jest.fn();
let query: Record<string, string> = {};

const testCase = {
  id: 1,
  displayId: 'TC1',
  name: 'Generated case',
  testFolder: { id: 7 },
  lifecycle: Lifecycle.READY,
  manualScenario: { preconditions: { value: 'Given a user' }, steps: [] },
  ai: {
    generatedByIteration: { pipelineId: 1, iterationId: 103, number: 4 },
    modifiedByAgent: false,
    factoryKey: 'spec::case',
  },
} as unknown as TestCase;

const renderPage = (
  isAiFactoryEnabled: boolean,
  testCases: TestCase[] = [testCase],
  canReviewAiTestCases = false,
  hasTestPlans = false,
  canAutomateTestCases = false,
) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isAiFactoryEnabled);
  jest.mocked(useIterationNumber).mockReturnValue(4);
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest.mocked(useSelector).mockImplementation((selector) => {
    if (selector === payloadSelector) return {};
    if (selector === locationQuerySelector) return query;
    if (selector === urlFolderIdSelector) return '';
    if (selector === foldersSelector) return [];
    return undefined;
  });
  jest.mocked(useProjectDetails).mockReturnValue({
    organizationSlug: 'org',
    projectSlug: 'project',
  } as ReturnType<typeof useProjectDetails>);
  jest.mocked(useURLBoundPagination).mockReturnValue({
    setPageNumber: jest.fn(),
    setPageSize: jest.fn(),
    resetToFirstPage: jest.fn(),
    captions: {
      items: 'items',
      of: 'of',
      page: 'page',
      goTo: 'go to',
      goAction: 'go',
      perPage: 'per page',
    },
    activePage: 1,
    offset: 0,
    pageSize: 50,
    totalPages: 1,
  });
  jest
    .mocked(useUserPermissions)
    .mockReturnValue({
      canAutomateTestCases,
      canManageTestCases: false,
      canReviewAiTestCases,
    } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useHasTestPlans).mockReturnValue({
    hasTestPlans,
    isCheckingTestPlansExistence: false,
  });
  jest.mocked(useAddTestCasesToTestPlanModal).mockReturnValue({
    openModal: openAddToTestPlanModal,
  });
  jest.mocked(useAddToLaunchModal).mockReturnValue({ openModal: openAddToLaunchModal });
  jest.mocked(useAutomationModal).mockReturnValue({ openModal: openAutomationModal });
  jest
    .mocked(useRefetchCurrentTestCases)
    .mockReturnValue(refetchCurrentTestCases);
  jest.mocked(useBatchDuplicateTestCasesModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useBatchDeleteTestCasesModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useMoveTestCaseModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useBatchEditTagsModal).mockReturnValue({ openModal: jest.fn() });

  return shallow(
    <AllTestCasesPage
      testCases={testCases}
      isLoading={false}
      instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      testCasesPageData={{ number: 1, size: 50, totalElements: testCases.length, totalPages: 1 }}
    />,
  );
};

describe('AllTestCasesPage AI filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    query = {};
  });

  test('shows bulk Approve only for a permitted selection while the feature is enabled', () => {
    const permitted = renderPage(true, [testCase], true);
    const selectRows = permitted.find(TestCaseList).prop('handleSelectedRows') as (
      rows: { id: number; folderId: number }[],
    ) => void;
    selectRows([{ id: testCase.id, folderId: testCase.testFolder.id }]);

    expect(permitted.find(BulkApproveButton)).toHaveLength(1);
    expect(renderPage(false, [testCase], true).find(BulkApproveButton)).toHaveLength(0);
  });

  test('shows bulk Automate only with the feature and permission, then refreshes on success', () => {
    const permitted = renderPage(true, [testCase], false, false, true);
    const selectRows = permitted.find(TestCaseList).prop('handleSelectedRows') as (
      rows: { id: number; folderId: number }[],
    ) => void;
    selectRows([{ id: testCase.id, folderId: testCase.testFolder.id }]);

    const automate = permitted.find('[data-automation-id="bulk-automate-test-cases"]');
    expect(automate).toHaveLength(1);
    (automate.prop('onClick') as () => void)();
    const modalData = openAutomationModal.mock.calls[0][0];
    expect(modalData.testCases).toEqual([testCase]);

    modalData.onSuccess?.({
      iteration: { pipelineId: 2, iterationId: 201, number: 1 },
      accepted: [testCase.id],
      skipped: [],
    });
    expect(refetchCurrentTestCases).toHaveBeenCalled();
    expect(permitted.find('[data-automation-id="bulk-automate-test-cases"]')).toHaveLength(0);

    expect(renderPage(false, [testCase], false, false, true).find('[data-automation-id="bulk-automate-test-cases"]')).toHaveLength(0);
    expect(renderPage(true, [testCase], false, false, false).find('[data-automation-id="bulk-automate-test-cases"]')).toHaveLength(0);
  });

  test('clears only backend-accepted rows and retains client and backend skips', () => {
    const backendSkipped = { ...testCase, id: 2, displayId: 'TC2', name: 'Backend skipped' };
    const clientSkipped = {
      ...testCase,
      id: 3,
      displayId: 'TC3',
      name: 'Draft client skip',
      lifecycle: Lifecycle.DRAFT,
    };
    const wrapper = renderPage(
      true,
      [testCase, backendSkipped, clientSkipped],
      false,
      false,
      true,
    );
    const selection = [testCase, backendSkipped, clientSkipped].map(({ id, testFolder }) => ({
      id,
      folderId: testFolder.id,
    }));
    (wrapper.find(TestCaseList).prop('handleSelectedRows') as (rows: typeof selection) => void)(
      selection,
    );

    (wrapper.find('[data-automation-id="bulk-automate-test-cases"]').prop('onClick') as () =>
      void)();
    const modalData = openAutomationModal.mock.calls[0][0];
    expect(modalData.testCases).toEqual([testCase, backendSkipped, clientSkipped]);

    modalData.onSuccess?.({
      iteration: { pipelineId: 2, iterationId: 201, number: 1 },
      accepted: [testCase.id],
      skipped: [
        { id: backendSkipped.id, displayId: backendSkipped.displayId, reason: 'FIX_RUNNING' },
      ],
    });

    expect(wrapper.find(TestCaseList).prop('selectedRows')).toEqual([
      expect.objectContaining({ id: backendSkipped.id }),
      expect.objectContaining({ id: clientSkipped.id }),
    ]);
    expect(refetchCurrentTestCases).toHaveBeenCalled();
  });

  test('keeps bulk Automate disabled with a reason for an all-ineligible selection', () => {
    const draftCase = { ...testCase, lifecycle: Lifecycle.DRAFT };
    const wrapper = renderPage(true, [draftCase], false, false, true);
    const selection = [{ id: draftCase.id, folderId: draftCase.testFolder.id }];

    (wrapper.find(TestCaseList).prop('handleSelectedRows') as (rows: typeof selection) => void)(
      selection,
    );

    expect(wrapper.find('[data-automation-id="bulk-automate-test-cases"]').prop('disabled')).toBe(
      true,
    );
    expect(wrapper.find({ content: 'Only Ready Test Cases can be automated' })).toHaveLength(1);
    expect(openAutomationModal).not.toHaveBeenCalled();
  });

  test('bulk Test Plan action sends only Ready cases and names skipped Draft cases', () => {
    const draftCase = {
      ...testCase,
      id: 2,
      displayId: 'TC2',
      name: 'Draft case',
      lifecycle: Lifecycle.DRAFT,
    };
    const wrapper = renderPage(true, [testCase, draftCase], false, true);
    const selectRows = wrapper.find(TestCaseList).prop('handleSelectedRows') as (
      rows: { id: number; folderId: number }[],
    ) => void;
    selectRows([
      { id: testCase.id, folderId: testCase.testFolder.id },
      { id: draftCase.id, folderId: draftCase.testFolder.id },
    ]);

    const addToTestPlan = wrapper.find('[data-automation-id="bulk-add-to-test-plan"]');
    (addToTestPlan.prop('onClick') as () => void)();

    expect(openAddToTestPlanModal).toHaveBeenCalledWith({ selectedTestCaseIds: [testCase.id] });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'WARNING',
      payload: { message: 'Skipped Draft Test Cases: TC2 — Draft case' },
    });
  });

  test('bulk gates are disabled for an all-Draft selection only while the feature is enabled', () => {
    const draftCase = { ...testCase, lifecycle: Lifecycle.DRAFT };
    const enabled = renderPage(true, [draftCase], false, true);
    const selection = [{ id: draftCase.id, folderId: draftCase.testFolder.id }];

    (enabled.find(TestCaseList).prop('handleSelectedRows') as (rows: typeof selection) => void)(
      selection,
    );
    expect(
      enabled.find({ content: 'Only Ready Test Cases can be added to a Test Plan' }),
    ).toHaveLength(1);

    const disabled = renderPage(false, [draftCase], false, true);
    (disabled.find(TestCaseList).prop('handleSelectedRows') as (rows: typeof selection) => void)(
      selection,
    );

    expect(
      disabled.find('[data-automation-id="bulk-add-to-test-plan"]').prop('disabled'),
    ).not.toBe(true);
  });

  test('normalizes URL filter values and resolves the iteration number', () => {
    query = { lifecycle: 'DRAFT', ai: 'AI', iteration: '103' };

    const wrapper = renderPage(true);

    expect(wrapper.find(QuickFilters).props()).toMatchObject({
      lifecycle: Lifecycle.DRAFT,
      ai: 'AI',
      iteration: '103',
      iterationNumber: 4,
    });
    expect(wrapper.find(TestCaseList).prop('hasAiFilters')).toBe(true);
  });

  test('ignores malformed URL values', () => {
    query = { lifecycle: 'draft', ai: 'yes', iteration: '-1' };

    const wrapper = renderPage(true);

    expect(wrapper.find(QuickFilters).props()).toMatchObject({
      lifecycle: undefined,
      ai: undefined,
      iteration: undefined,
    });
    expect(wrapper.find(TestCaseList).prop('hasAiFilters')).toBe(false);
  });

  test('hides AI filters and ignores their empty-state semantics while the feature is disabled', () => {
    query = { lifecycle: 'DRAFT', ai: 'AI', iteration: '103' };

    const wrapper = renderPage(false, []);

    expect(wrapper.find(QuickFilters)).toHaveLength(0);
    expect(wrapper.find(TestCaseList)).toHaveLength(0);
    expect(wrapper.find(FolderEmptyState)).toHaveLength(1);
  });

  test('keeps the filtered list mounted for an empty AI-filter result', () => {
    query = { lifecycle: 'READY', ai: 'NO_AI' };

    const wrapper = renderPage(true, []);

    expect(wrapper.find(FolderEmptyState)).toHaveLength(0);
    expect(wrapper.find(TestCaseList).prop('hasAiFilters')).toBe(true);
  });

  test('resets pagination when a quick filter changes', () => {
    query = { offset: '150', limit: '50', iteration: '103' };
    const wrapper = renderPage(true);

    const onChange = wrapper.find(QuickFilters).prop('onChange') as (value: {
      lifecycle: Lifecycle;
    }) => void;
    onChange({ lifecycle: Lifecycle.READY });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'updatePagePropertiesAction',
      payload: { lifecycle: Lifecycle.READY, limit: 50, offset: 0 },
    });
  });

  test('Clear removes only AI keys so search, priority and tag filters remain in the URL state', () => {
    query = {
      testCasesSearchParams: 'login',
      filterPriorities: 'HIGH',
      filterTags: 'smoke',
      lifecycle: 'DRAFT',
      ai: 'AI',
      iteration: '103',
      offset: '150',
      limit: '50',
    };
    const wrapper = renderPage(true);
    const onChange = wrapper.find(QuickFilters).prop('onChange') as (value: {
      lifecycle?: Lifecycle;
      ai?: 'AI' | 'NO_AI';
      iteration?: string;
    }) => void;

    onChange({ lifecycle: undefined, ai: undefined, iteration: undefined });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'updatePagePropertiesAction',
      payload: {
        lifecycle: undefined,
        ai: undefined,
        iteration: undefined,
        limit: 50,
        offset: 0,
      },
    });
    expect(query).toMatchObject({
      testCasesSearchParams: 'login',
      filterPriorities: 'HIGH',
      filterTags: 'smoke',
    });
  });
});
