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

import { act } from 'react';
import { mount, shallow } from 'enzyme';
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import { isLoadingTestCaseDetailsSelector, testCaseDetailsSelector } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { LifecycleHistory, useTestCaseAi } from 'pages/inside/aiFactory/lifecycle';
import { EvaluationPanel } from 'pages/inside/aiFactory/evaluation';
import { GenerationCost } from 'pages/inside/aiFactory/generationCost';
import { AutomationSection } from 'pages/inside/aiFactory/automation';
import { usePolling } from 'pages/inside/aiFactory/common';
import { NativeTestCaseSummary } from 'pages/inside/aiFactory/common/nativeTestCaseSummary/nativeTestCaseSummary';
import { PipelineLinks } from 'pages/inside/aiFactory/pipelineLinks';
import { LaunchBlockedBanner } from 'pages/inside/aiFactory/readyOnlyGate';
import {
  ReviewTarget,
  ReviewStrip,
  useFixRound,
  useReviewComments,
} from 'pages/inside/aiFactory/review';
import { LiveReviewStrip } from 'pages/inside/aiFactory/review/liveReviewStrip';
import { useLiveReviewComments } from 'pages/inside/aiFactory/review/useLiveReviewComments';
import type { LiveReviewCommentsLoadState } from 'pages/inside/aiFactory/review/useLiveReviewComments';
import { hasScenarioContent, hasStepContent } from 'pages/inside/common/scenarioUtils';
import { useAddTestCasesToTestPlanModal } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { AutomationStatus, Lifecycle, type TestCaseAiRS } from 'types/aiFactory';
import type { ExtendedTestCase } from 'types/testCase';

import { useDescriptionModal } from './descriptionModal';
import { TestCaseDetailsPage } from './testCaseDetailsPage';
import { useTestCaseTags } from './useTestCaseTags';
import { checkScenario } from './utils';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: 'mock-BubblesLoader',
  Button: 'mock-Button',
  EditIcon: 'mock-EditIcon',
  PlusIcon: 'mock-PlusIcon',
  SystemMessage: 'mock-SystemMessage',
}));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({ TEST_CASE_LIBRARY_EVENTS: { submitAddTag: jest.fn() } }),
  { virtual: true },
);
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch, useSelector: jest.fn() }));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('common/utils', () => ({
  fetch: jest.fn(),
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSectionWithHeaderControl: 'mock-CollapsibleSectionWithHeaderControl',
}));
jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: 'mock-ExpandedTextSection',
}));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'mock-ScrollWrapper' }));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'mock-SettingsLayout' }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/testCase', () => ({
  GET_TEST_CASE_DETAILS: 'GET_TEST_CASE_DETAILS',
  isLoadingTestCaseDetailsSelector: jest.fn(),
  testCaseDetailsSelector: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/evaluation', () => ({ EvaluationPanel: 'mock-EvaluationPanel' }));
jest.mock('pages/inside/aiFactory/generationCost', () => ({
  GenerationCost: 'mock-GenerationCost',
}));
jest.mock('pages/inside/aiFactory/automation', () => ({
  AutomationSection: 'mock-AutomationSection',
}));
jest.mock('pages/inside/aiFactory/common', () => ({ usePolling: jest.fn() }));
jest.mock('pages/inside/aiFactory/common/nativeTestCaseSummary/nativeTestCaseSummary', () => ({
  NativeTestCaseSummary: 'mock-NativeTestCaseSummary',
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/inside/aiFactory/lifecycle', () => ({
  LifecycleHistory: 'mock-LifecycleHistory',
  useTestCaseAi: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/pipelineLinks', () => ({ PipelineLinks: 'mock-PipelineLinks' }));
jest.mock('pages/inside/aiFactory/review', () => ({
  ReviewStrip: 'mock-ReviewStrip',
  ReviewTarget: 'mock-ReviewTarget',
  useFixRound: jest.fn(),
  useReviewComments: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/review/liveReviewStrip', () => ({
  LiveReviewStrip: 'mock-LiveReviewStrip',
}));
jest.mock('pages/inside/aiFactory/review/useLiveReviewComments', () => ({
  useLiveReviewComments: jest.fn(),
}));
jest.mock('pages/inside/common/attachmentsWithSlider', () => ({
  AttachmentsWithSlider: 'mock-AttachmentsWithSlider',
}));
jest.mock('pages/inside/common/requirementsList/requirementsList', () => ({
  RequirementsList: 'mock-RequirementsList',
}));
jest.mock('pages/inside/common/scenario', () => ({ Scenario: 'mock-Scenario' }));
jest.mock('pages/inside/common/scenarioUtils', () => ({
  hasScenarioContent: jest.fn(() => false),
  hasStepContent: jest.fn(() => false),
  hasStepsPreconditionContent: jest.fn(() => false),
}));
jest.mock('pages/inside/productVersionPage/linkedTestCasesTab/tagList', () => ({
  AdaptiveTagList: 'mock-AdaptiveTagList',
}));
jest.mock(
  'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal',
  () => ({ useAddTestCasesToTestPlanModal: jest.fn() }),
);
jest.mock('./descriptionModal', () => ({ useDescriptionModal: jest.fn() }));
jest.mock('./precondition', () => ({ Precondition: 'mock-Precondition' }));
jest.mock('./stepsList', () => ({ StepsList: 'mock-StepsList' }));
jest.mock('./testCaseDetailsHeader', () => ({
  TestCaseDetailsHeader: 'mock-TestCaseDetailsHeader',
}));
jest.mock('./useTestCaseTags', () => ({ useTestCaseTags: jest.fn() }));
jest.mock('./utils', () => ({ checkScenario: jest.fn(() => true) }));
jest.mock('../emptyState/details/detailsEmptyState', () => ({
  DetailsEmptyState: 'mock-DetailsEmptyState',
}));
jest.mock('../tagPopover', () => ({ TagPopover: 'mock-TagPopover' }));

const testCase = {
  id: 42,
  name: 'Lifecycle case',
  description: '',
  attributes: [],
  lifecycle: Lifecycle.DRAFT,
  updatedAt: 100,
  manualScenario: {},
} as unknown as ExtendedTestCase;

const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;
const getReviewStrip = (wrapper: ReturnType<typeof shallow>) =>
  (
    wrapper.find('TestCaseReviewStrip') as ReturnType<typeof shallow> & {
      dive: () => ReturnType<typeof shallow>;
    }
  ).dive();

let selectedTestCase = testCase;
let selectedAiDetails: TestCaseAiRS | null = null;
let testCaseDetailsLoading = false;
let aiDetailsLoading = false;
let aiDetailsError = false;
let canReviewAiTestCases = true;
let liveReviewOverrides: Partial<LiveReviewCommentsLoadState> = {};
const aiDetailsReload = jest.fn();

const renderPage = (isEnabled: boolean, canAutomateTestCases = false) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useSelector).mockImplementation((selector) => {
    if (selector === testCaseDetailsSelector) return selectedTestCase;
    if (selector === isLoadingTestCaseDetailsSelector) return testCaseDetailsLoading;
    if (selector === projectKeySelector) return 'demo';
    if (selector === urlOrganizationAndProjectSelector) {
      return { organizationSlug: 'my-organization', projectSlug: 'demo-project' };
    }
    return undefined;
  });
  jest.mocked(useUserPermissions).mockReturnValue({
    canAutomateTestCases,
    canManageTestCases: false,
    canReviewAiTestCases,
  } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useAddTestCasesToTestPlanModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useDescriptionModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useTestCaseAi).mockReturnValue({
    data: selectedAiDetails,
    isLoading: aiDetailsLoading,
    isError: aiDetailsError,
    reload: aiDetailsReload,
  });
  jest.mocked(useReviewComments).mockReturnValue({
    comments: [],
    isLoading: false,
    isError: false,
    isMutating: false,
    reload: jest.fn(),
    addComment: jest.fn(() => Promise.resolve()),
    deleteComment: jest.fn(() => Promise.resolve()),
    discardPending: jest.fn(() => Promise.resolve()),
  });
  jest.mocked(useLiveReviewComments).mockReturnValue({
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
    addComment: jest.fn(() => Promise.resolve(true)),
    deleteComment: jest.fn(() => Promise.resolve(true)),
    discardPending: jest.fn(() => Promise.resolve(true)),
    ...liveReviewOverrides,
  });
  jest.mocked(useFixRound).mockReturnValue({
    current: null,
    isLoading: false,
    isStarting: false,
    isError: false,
    start: jest.fn(() => Promise.resolve()),
    reload: jest.fn(),
  });
  jest.mocked(useTestCaseTags).mockReturnValue({
    addTag: jest.fn(() => Promise.resolve()),
    removeTag: jest.fn(() => Promise.resolve()),
    updateTestCaseTags: jest.fn(() => Promise.resolve()),
    isLoading: false,
  });

  return shallow(<TestCaseDetailsPage />);
};

interface LifecycleHistoryWrapper {
  key: () => string | null;
  props: () => Record<string, unknown>;
}

describe('TestCaseDetailsPage lifecycle history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(checkScenario).mockReturnValue(true);
    selectedTestCase = testCase;
    selectedAiDetails = null;
    testCaseDetailsLoading = false;
    aiDetailsLoading = false;
    aiDetailsError = false;
    liveReviewOverrides = {};
    canReviewAiTestCases = true;
    jest.mocked(hasScenarioContent).mockReturnValue(false);
    jest.mocked(hasStepContent).mockReturnValue(false);
    fetchMock.mockReset();
  });

  test.each(['AI', 'MANUAL'] as const)(
    'uses native %s data without activating provisional endpoints or unsupported sections',
    async (origin) => {
      selectedTestCase = {
        ...testCase,
        origin,
        status: 'DRAFT',
        metrics: { overallScore: 0, obsolete: true, costUsd: 0 },
        ai: {
          generatedByIteration: { pipelineId: 1, iterationId: 101, number: 1 },
          modifiedByAgent: true,
          factoryKey: 'stale overlay',
        },
        automation: { status: AutomationStatus.IN_PROGRESS },
        review: { unsentCommentsCount: 2 },
      };
      // Keep real request-hook effects: enabling a provisional API fails the request assertion.
      const wrapper = renderPage(true, true);
      jest
        .mocked(useTestCaseAi)
        .mockImplementation(
          jest.requireActual<typeof import('pages/inside/aiFactory/lifecycle/useTestCaseAi')>(
            'pages/inside/aiFactory/lifecycle/useTestCaseAi',
          ).useTestCaseAi,
        );
      jest
        .mocked(useReviewComments)
        .mockImplementation(
          jest.requireActual<typeof import('pages/inside/aiFactory/review/useReviewComments')>(
            'pages/inside/aiFactory/review/useReviewComments',
          ).useReviewComments,
        );
      jest
        .mocked(useFixRound)
        .mockImplementation(
          jest.requireActual<typeof import('pages/inside/aiFactory/review/useFixRound')>(
            'pages/inside/aiFactory/review/useFixRound',
          ).useFixRound,
        );

      jest
        .mocked(useLiveReviewComments)
        .mockImplementation(
          jest.requireActual<typeof import('pages/inside/aiFactory/review/useLiveReviewComments')>(
            'pages/inside/aiFactory/review/useLiveReviewComments',
          ).useLiveReviewComments,
        );
      fetchMock.mockResolvedValue({ comments: [], unsentCount: 0, fixInProgress: false });
      let mountedPage!: ReturnType<typeof mount> & { update: () => void };
      await act(async () => {
        mountedPage = mount(<TestCaseDetailsPage />) as typeof mountedPage;
        await Promise.resolve();
      });
      mountedPage.update();

      if (origin === 'AI') {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/test-case\/42\/review$/),
          expect.any(Object),
        );
      } else {
        expect(fetch).not.toHaveBeenCalled();
      }
      expect(
        jest
          .mocked(fetch)
          .mock.calls.every(
            ([url]) => !/\/(?:ai|review-comment|fix-round|lifecycle)(?:[/?]|$)/.test(url),
          ),
      ).toBe(true);
      expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, origin === 'AI', {
        canApprove: true,
        versionId: undefined,
        onFixCompleted: expect.any(Function),
      });
      expect(useTestCaseAi).toHaveBeenLastCalledWith('demo', 42, false, 100);
      expect(useReviewComments).toHaveBeenLastCalledWith('demo', 42, false);
      expect(useFixRound).toHaveBeenLastCalledWith('demo', 42, false, expect.any(Object));
      expect(wrapper.find(NativeTestCaseSummary)).toHaveLength(origin === 'AI' ? 1 : 0);
      expect(getReviewStrip(wrapper).find(ReviewStrip)).toHaveLength(0);
      expect(getReviewStrip(wrapper).find(LiveReviewStrip)).toHaveLength(origin === 'AI' ? 1 : 0);
      expect(wrapper.find(EvaluationPanel)).toHaveLength(0);
      expect(wrapper.find(GenerationCost)).toHaveLength(0);
      expect(wrapper.find(PipelineLinks)).toHaveLength(0);
      expect(wrapper.find(LifecycleHistory)).toHaveLength(0);
      expect(wrapper.find(AutomationSection)).toHaveLength(0);
      expect(wrapper.find(LaunchBlockedBanner)).toHaveLength(0);
      expect(usePolling).toHaveBeenCalledWith(expect.any(Function), 3000, false);
      act(() => mountedPage.unmount());
    },
  );

  test('shares one native Review read with the header and reconciles it after approval without optimistic Ready', async () => {
    selectedTestCase = { ...testCase, origin: 'AI', status: 'DRAFT', defaultVersionId: 100 };
    renderPage(true);
    jest
      .mocked(useLiveReviewComments)
      .mockImplementation(
        jest.requireActual<typeof import('pages/inside/aiFactory/review/useLiveReviewComments')>(
          'pages/inside/aiFactory/review/useLiveReviewComments',
        ).useLiveReviewComments,
      );
    fetchMock.mockImplementation((_url, params) =>
      Promise.resolve(
        params?.method === 'PATCH'
          ? { status: 200, data: {} }
          : { comments: [], unsentCount: 0, fixInProgress: false },
      ),
    );
    let mountedPage!: ReturnType<typeof mount> & { update: () => void };
    await act(async () => {
      mountedPage = mount(<TestCaseDetailsPage />) as typeof mountedPage;
      await Promise.resolve();
      await Promise.resolve();
    });
    mountedPage.update();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, true, {
      canApprove: true,
      versionId: 100,
      onFixCompleted: expect.any(Function),
    });
    const header = mountedPage.find('mock-TestCaseDetailsHeader');
    const state = header.prop('nativeReviewState') as LiveReviewCommentsLoadState;
    expect(state.isLoaded).toBe(true);
    expect(state.approveReady).toEqual(expect.any(Function));
    await act(async () => {
      expect(await state.approveReady?.()).toBe(true);
      await Promise.resolve();
      await Promise.resolve();
    });
    mountedPage.update();
    expect(fetchMock.mock.calls.filter(([url]) => /\/review$/.test(url))).toHaveLength(2);
    expect(fetchMock.mock.calls.filter(([, params]) => params?.method === 'PATCH')).toHaveLength(1);
    expect(mountedPage.find('mock-TestCaseDetailsHeader').prop('testCase')).toMatchObject({
      status: 'DRAFT',
    });
    expect(
      (
        mountedPage
          .find('mock-TestCaseDetailsHeader')
          .prop('nativeReviewState') as LiveReviewCommentsLoadState
      ).isApproved,
    ).toBe(true);
    act(() => mountedPage.unmount());
  });

  test.each(['FIXED', 'FIXED_GRADE_FAILED', 'FAILED'] as const)(
    'a mounted native %s completion refreshes the current case and Review through live endpoints',
    async (status) => {
      jest.useFakeTimers();
      selectedTestCase = {
        ...testCase,
        origin: 'AI',
        status: 'DRAFT',
        defaultVersionId: 100,
        metrics: { overallScore: 92 },
      };
      renderPage(true);
      jest
        .mocked(useLiveReviewComments)
        .mockImplementation(
          jest.requireActual<typeof import('pages/inside/aiFactory/review/useLiveReviewComments')>(
            'pages/inside/aiFactory/review/useLiveReviewComments',
          ).useLiveReviewComments,
        );
      let currentRound = { id: 5, testCaseId: 42, roundNumber: 1, status: 'PENDING' };
      let unsentCount = 1;
      fetchMock.mockImplementation((url, params) => {
        if (url.endsWith('/review'))
          return Promise.resolve({ comments: [], unsentCount, fixInProgress: false });
        if (url.endsWith('/review/fix-round') && params?.method === 'POST')
          return Promise.resolve({ status: 200, data: currentRound });
        if (url.endsWith('/review/fix-round/5'))
          return Promise.resolve({ status: 200, data: currentRound });
        throw new Error(`Unexpected request ${url}`);
      });
      const flush = () =>
        Array.from({ length: 12 }).reduce<Promise<void>>(
          (pending) => pending.then(() => undefined),
          Promise.resolve(),
        );
      let mountedPage!: ReturnType<typeof mount> & { update: () => void };
      try {
        await act(async () => {
          mountedPage = mount(<TestCaseDetailsPage />) as typeof mountedPage;
          await flush();
        });
        mountedPage.update();
        expect(mountedPage.find(NativeTestCaseSummary).prop('summary')).toMatchObject({
          score: 92,
        });
        const currentState = () =>
          mountedPage
            .find('mock-TestCaseDetailsHeader')
            .prop('nativeReviewState') as LiveReviewCommentsLoadState;
        await act(async () => {
          expect(await currentState().pushToAgent?.()).toBe(true);
          await flush();
        });
        mountedPage.update();
        expect(mountedPage.find('mock-TestCaseDetailsHeader').prop('isNativeFixInProgress')).toBe(
          true,
        );
        mockDispatch.mockClear();
        currentRound = { ...currentRound, status };
        unsentCount = 0;
        await act(async () => {
          jest.advanceTimersByTime(3000);
          await flush();
        });
        mountedPage.update();
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'GET_TEST_CASE_DETAILS',
          payload: { testCaseId: 42 },
        });
        expect(currentState().fixRoundState?.status).toBe(status);
        expect(currentState().fixInProgress).toBe(false);
        expect(currentState().unsentCount).toBe(0);
        expect(
          fetchMock.mock.calls.filter(([url]) => /\/review$/.test(url)).length,
        ).toBeGreaterThanOrEqual(3);
        expect(
          fetchMock.mock.calls.some(([url]) =>
            /\/ai$|\/review-comment|(?<!review)\/fix-round/.test(url),
          ),
        ).toBe(false);
        expect(aiDetailsReload).not.toHaveBeenCalled();
        if (status !== 'FAILED') {
          selectedTestCase = { ...selectedTestCase, defaultVersionId: 101, metrics: undefined };
          await act(async () => {
            mountedPage.setProps({});
            await flush();
          });
          mountedPage.update();
          expect(mountedPage.find(NativeTestCaseSummary).prop('summary')).toMatchObject({
            status: 'DRAFT',
          });
          expect(mountedPage.find(NativeTestCaseSummary).prop('summary')).not.toHaveProperty(
            'score',
            92,
          );
          expect(mountedPage.find('mock-TestCaseDetailsHeader').prop('testCase')).toMatchObject({
            defaultVersionId: 101,
          });
        }
      } finally {
        act(() => mountedPage?.unmount());
        jest.clearAllTimers();
        jest.useRealTimers();
      }
    },
  );

  test('keeps native summary hidden while the feature flag is disabled', () => {
    selectedTestCase = { ...testCase, origin: 'AI', status: 'READY' };

    const wrapper = renderPage(false, true);

    expect(wrapper.find(NativeTestCaseSummary)).toHaveLength(0);
    expect(getReviewStrip(wrapper).find(ReviewStrip)).toHaveLength(0);
    expect(wrapper.find(AutomationSection)).toHaveLength(0);
    expect(useTestCaseAi).toHaveBeenLastCalledWith('demo', 42, false, 100);
    expect(useReviewComments).toHaveBeenLastCalledWith('demo', 42, false);
  });

  test('does not mount History while the feature is disabled', () => {
    const wrapper = renderPage(false);

    expect(wrapper.find(LifecycleHistory)).toHaveLength(0);
  });

  test('mounts Automation only when both the feature and permission are enabled', () => {
    expect(renderPage(true, true).find(AutomationSection).prop('testCase')).toBe(testCase);
    expect(renderPage(false, true).find(AutomationSection)).toHaveLength(0);
    expect(renderPage(true, false).find(AutomationSection)).toHaveLength(0);
  });

  test('shows running automation to a viewer without granting the Automate action', () => {
    selectedAiDetails = {
      pipelineLinks: [],
      lifecycleHistory: [],
      automation: {
        status: AutomationStatus.IN_PROGRESS,
        iteration: { pipelineId: 7, iterationId: 103, number: 3 },
        scenarioChangedAfterAutomation: false,
      },
    };

    const section = renderPage(true, false).find(AutomationSection);

    expect(section).toHaveLength(1);
    expect(section.props()).toMatchObject({
      automation: selectedAiDetails.automation,
      canAutomate: false,
      organizationSlug: 'my-organization',
      projectSlug: 'demo-project',
    });
  });

  test.each([AutomationStatus.AUTOMATED, AutomationStatus.FAILED])(
    'shows the terminal %s result to a viewer without granting the Automate action',
    (status) => {
      selectedAiDetails = {
        pipelineLinks: [],
        lifecycleHistory: [],
        automation: {
          status,
          lastResult: { status: status === AutomationStatus.AUTOMATED ? 'PASSED' : 'FAILED' },
          scenarioChangedAfterAutomation: false,
        },
      };

      const section = renderPage(true, false).find(AutomationSection);

      expect(section).toHaveLength(1);
      expect(section.props()).toMatchObject({
        automation: selectedAiDetails.automation,
        canAutomate: false,
      });
    },
  );

  test('keeps terminal automation hidden when the feature flag is disabled', () => {
    selectedAiDetails = {
      pipelineLinks: [],
      lifecycleHistory: [],
      automation: {
        status: AutomationStatus.AUTOMATED,
        lastResult: { status: 'PASSED' },
        scenarioChangedAfterAutomation: false,
      },
    };

    expect(renderPage(false, false).find(AutomationSection)).toHaveLength(0);
  });

  test.each([
    { state: 'loading', isLoading: true, isError: false },
    { state: 'error', isLoading: false, isError: true },
  ])('shows the initial AI $state state to a viewer and wires retry', ({ isLoading, isError }) => {
    aiDetailsLoading = isLoading;
    aiDetailsError = isError;

    const section = renderPage(true, false).find(AutomationSection);

    expect(section).toHaveLength(1);
    expect(section.props()).toMatchObject({
      automation: undefined,
      canAutomate: false,
      isLoading,
      isError,
      onRetry: aiDetailsReload,
    });
  });

  test('passes retained automation data through while the AI request refreshes', () => {
    selectedAiDetails = {
      pipelineLinks: [],
      lifecycleHistory: [],
      automation: {
        status: AutomationStatus.AUTOMATED,
        lastResult: { status: 'PASSED' },
        scenarioChangedAfterAutomation: false,
      },
    };
    aiDetailsLoading = true;

    expect(renderPage(true, false).find(AutomationSection).props()).toMatchObject({
      automation: selectedAiDetails.automation,
      isLoading: true,
      isError: false,
    });
  });

  test.each([
    { name: 'feature is disabled', isEnabled: false, isLoading: false },
    { name: 'test-case details are loading', isEnabled: true, isLoading: true },
  ])('does not poll while $name', ({ isEnabled, isLoading }) => {
    selectedAiDetails = {
      pipelineLinks: [],
      lifecycleHistory: [],
      automation: {
        status: AutomationStatus.IN_PROGRESS,
        iteration: { pipelineId: 7, iterationId: 103, number: 3 },
        scenarioChangedAfterAutomation: false,
      },
    };
    testCaseDetailsLoading = isLoading;

    renderPage(isEnabled);

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 3000, false);
  });

  test('polls a running automation every 3 seconds and refreshes both resources', () => {
    selectedAiDetails = {
      pipelineLinks: [],
      lifecycleHistory: [],
      automation: {
        status: AutomationStatus.IN_PROGRESS,
        iteration: { pipelineId: 7, iterationId: 103, number: 3 },
        scenarioChangedAfterAutomation: false,
      },
    };
    renderPage(true);
    const poll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 3000, true);
    poll?.();
    expect(aiDetailsReload).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'GET_TEST_CASE_DETAILS',
      payload: { testCaseId: 42 },
    });
  });

  test.each([AutomationStatus.AUTOMATED, AutomationStatus.FAILED, AutomationStatus.NOT_AUTOMATED])(
    'stops polling when automation reaches %s',
    (status) => {
      selectedAiDetails = {
        pipelineLinks: [],
        lifecycleHistory: [],
        automation: { status, scenarioChangedAfterAutomation: false },
      };

      renderPage(true);

      expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 3000, false);
    },
  );

  test('refreshes AI and test-case details after automation starts', () => {
    const wrapper = renderPage(true, true);

    (wrapper.find(AutomationSection).prop('onSuccess') as () => void)();

    expect(aiDetailsReload).toHaveBeenCalled();
  });

  test('shows the blocked-plan banner for a planned Draft case only while enabled', () => {
    selectedTestCase = {
      ...testCase,
      blockedPlans: [{ id: 7, name: 'Release regression' }],
    };

    expect(renderPage(true).find(LaunchBlockedBanner).prop('plans')).toEqual(
      selectedTestCase.blockedPlans,
    );
    expect(renderPage(false).find(LaunchBlockedBanner)).toHaveLength(0);
  });

  test('shares one AI details request between all AI details sections', () => {
    selectedTestCase = {
      ...testCase,
      ai: {
        generatedByIteration: { pipelineId: 1, iterationId: 101, number: 1 },
        modifiedByAgent: false,
        factoryKey: 'REQ-1::Lifecycle case',
      },
    };

    const wrapper = renderPage(true);

    expect(useTestCaseAi).toHaveBeenCalledWith('demo', 42, true, 100);
    expect(wrapper.find(EvaluationPanel)).toHaveLength(1);
    expect(wrapper.find(GenerationCost)).toHaveLength(1);
    expect(wrapper.find(PipelineLinks)).toHaveLength(1);
    expect(wrapper.find(EvaluationPanel).prop('aiDetailsState')).toBe(
      wrapper.find(LifecycleHistory).prop('aiDetailsState'),
    );
    expect(wrapper.find(GenerationCost).prop('aiDetailsState')).toBe(
      wrapper.find(LifecycleHistory).prop('aiDetailsState'),
    );
    expect(wrapper.find(PipelineLinks).prop('aiDetailsState')).toBe(
      wrapper.find(LifecycleHistory).prop('aiDetailsState'),
    );
  });

  test('remounts History when updatedAt changes while lifecycle stays Draft', () => {
    const wrapper = renderPage(true);
    const initialHistory = wrapper.find(LifecycleHistory) as unknown as LifecycleHistoryWrapper;

    expect(initialHistory.key()).toBe('42-DRAFT-100');
    expect(initialHistory.props()).toMatchObject({
      aiDetailsState: expect.objectContaining({ data: null, isLoading: false, isError: false }),
    });

    selectedTestCase = { ...testCase, updatedAt: 200 };
    wrapper.setProps({});
    const refreshedHistory = wrapper.find(LifecycleHistory) as unknown as LifecycleHistoryWrapper;

    expect(refreshedHistory.key()).toBe('42-DRAFT-200');
    expect(useTestCaseAi).toHaveBeenLastCalledWith('demo', 42, true, 200);
  });

  test('mounts review comments only for an AI case while the feature is enabled', () => {
    jest.mocked(checkScenario).mockReturnValue(false);
    selectedTestCase = {
      ...testCase,
      ai: {
        generatedByIteration: { pipelineId: 1, iterationId: 101, number: 1 },
        modifiedByAgent: false,
        factoryKey: 'REQ-1::Lifecycle case',
      },
      manualScenario: {
        manualScenarioType: 'TEXT',
        requirements: [],
        instructions: 'Open the Library',
        expectedResult: 'The Library is displayed',
      },
    } as unknown as ExtendedTestCase;

    const enabledPage = renderPage(true);
    const disabledPage = renderPage(false);

    expect(useReviewComments).toHaveBeenCalledWith('demo', 42, true);
    expect(getReviewStrip(enabledPage).find(ReviewStrip)).toHaveLength(1);
    expect(getReviewStrip(disabledPage).find(ReviewStrip)).toHaveLength(0);
  });

  test.each(['DRAFT', 'READY'] as const)(
    'renders live comments for native AI %s even with an empty scenario',
    (status) => {
      selectedTestCase = { ...testCase, origin: 'AI', status };
      const wrapper = renderPage(true);

      expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, true, {
        canApprove: status === 'DRAFT',
        versionId: undefined,
        onFixCompleted: expect.any(Function),
      });
      expect(getReviewStrip(wrapper).find(LiveReviewStrip)).toHaveLength(1);
      expect(getReviewStrip(wrapper).find(LiveReviewStrip).prop('lifecycle')).toBe(status);
      expect(getReviewStrip(wrapper).find(ReviewStrip)).toHaveLength(0);
      expect(useFixRound).toHaveBeenLastCalledWith('demo', 42, false, expect.any(Object));
    },
  );

  test('keeps live comments disabled for native MANUAL, legacy AI and feature flag OFF', () => {
    selectedTestCase = { ...testCase, origin: 'MANUAL', status: 'DRAFT' };
    expect(getReviewStrip(renderPage(true)).find(LiveReviewStrip)).toHaveLength(0);
    expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, false, expect.any(Object));
    selectedTestCase = { ...testCase, origin: 'AI', status: 'READY' };
    expect(getReviewStrip(renderPage(false)).find(LiveReviewStrip)).toHaveLength(0);
    expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, false, expect.any(Object));
    selectedTestCase = testCase;
    expect(getReviewStrip(renderPage(true)).find(LiveReviewStrip)).toHaveLength(0);
    expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, false, expect.any(Object));
  });

  test('locks native Review and header edits from fixInProgress without synthesizing a legacy round', () => {
    selectedTestCase = { ...testCase, origin: 'AI', status: 'DRAFT' };
    liveReviewOverrides = { fixInProgress: true };
    const wrapper = renderPage(true);

    expect(getReviewStrip(wrapper).find(LiveReviewStrip).prop('isReadOnly')).toBe(true);
    const header = wrapper.find('mock-TestCaseDetailsHeader');
    expect(header.prop('testCase')).not.toHaveProperty('review.fixRound');
    expect(header.prop('isNativeFixInProgress')).toBe(true);
    expect(usePolling).toHaveBeenCalledWith(expect.any(Function), 3000, false);
  });

  test.each([true, false])(
    'preserves original native step number or legacy step ID after filtering empty steps (native=%s)',
    (native) => {
      jest.mocked(checkScenario).mockReturnValue(false);
      jest.mocked(hasStepContent).mockImplementation((step) => Boolean(step.instructions));
      const steps = [
        { id: 800, instructions: '', expectedResult: '', attachments: [] },
        {
          id: 900,
          instructions: 'Open the Library',
          expectedResult: 'Library is displayed',
          attachments: [],
        },
      ];
      selectedTestCase = {
        ...testCase,
        ...(native
          ? { origin: 'AI', status: 'DRAFT' }
          : {
              ai: {
                generatedByIteration: { pipelineId: 1, iterationId: 101, number: 1 },
                modifiedByAgent: false,
                factoryKey: 'REQ-1',
              },
            }),
        manualScenario: { manualScenarioType: 'STEPS', requirements: [], steps },
      } as unknown as ExtendedTestCase;
      const wrapper = renderPage(true);
      const stepList = wrapper.find('mock-StepsList');
      const renderedSteps = stepList.prop('steps') as Array<{
        id: number;
        reviewStepNumber?: number;
      }>;
      expect(renderedSteps).toEqual([expect.objectContaining(steps[1])]);
      if (native) expect(renderedSteps[0].reviewStepNumber).toBe(2);
      const renderReviewControl = stepList.prop('renderReviewControl') as (
        stepId: number,
        stepNumber: number,
      ) => React.ReactElement<{ target: unknown }>;
      const control = renderReviewControl(900, renderedSteps[0].reviewStepNumber ?? 1);
      expect(control.type).toBe(ReviewTarget);
      expect(control.props.target).toEqual(
        native ? { type: 'STEP', stepNumber: 2 } : { type: 'STEP', stepId: 900 },
      );
    },
  );

  test('provides precondition and text scenario native comment targets', () => {
    jest.mocked(checkScenario).mockReturnValue(false);
    jest.mocked(hasScenarioContent).mockReturnValue(true);
    selectedTestCase = {
      ...testCase,
      origin: 'AI',
      status: 'READY',
      manualScenario: {
        manualScenarioType: 'TEXT',
        requirements: [],
        instructions: 'Open Library',
        expectedResult: 'Library opens',
      },
    } as unknown as ExtendedTestCase;
    const scenario = renderPage(true).find('mock-Scenario');
    const precondition = scenario.prop('preconditionReviewControl') as React.ReactElement<{
      target: unknown;
    }>;
    const text = scenario.prop('scenarioReviewControl') as React.ReactElement<{ target: unknown }>;
    expect(precondition.props.target).toEqual({ type: 'PRECONDITION' });
    expect(text.props.target).toEqual({ type: 'TEXT_SCENARIO' });
  });

  test.each([true, false])(
    'applies native editor or viewer permissions without hiding readable review (editor=%s)',
    (canReview) => {
      selectedTestCase = { ...testCase, origin: 'AI', status: 'READY' };
      canReviewAiTestCases = canReview;
      const wrapper = renderPage(true);
      expect(getReviewStrip(wrapper).find(LiveReviewStrip).prop('isReadOnly')).toBe(!canReview);
      expect(useLiveReviewComments).toHaveBeenLastCalledWith('demo', 42, true, {
        canApprove: false,
        versionId: undefined,
        onFixCompleted: expect.any(Function),
      });
    },
  );

  test('routes a native detail text comment through GET and POST Review only', async () => {
    jest.mocked(checkScenario).mockReturnValue(false);
    jest.mocked(hasScenarioContent).mockReturnValue(true);
    selectedTestCase = {
      ...testCase,
      origin: 'AI',
      status: 'READY',
      manualScenario: {
        manualScenarioType: 'TEXT',
        requirements: [],
        instructions: 'Open Library',
        expectedResult: 'Library opens',
      },
    } as unknown as ExtendedTestCase;
    renderPage(true);
    jest
      .mocked(useLiveReviewComments)
      .mockImplementation(
        jest.requireActual<typeof import('pages/inside/aiFactory/review/useLiveReviewComments')>(
          'pages/inside/aiFactory/review/useLiveReviewComments',
        ).useLiveReviewComments,
      );
    fetchMock.mockResolvedValue({ comments: [], unsentCount: 0, fixInProgress: false });
    let wrapper!: ReturnType<typeof mount> & { update: () => void };
    await act(async () => {
      wrapper = mount(<TestCaseDetailsPage />) as typeof wrapper;
      await Promise.resolve();
    });
    wrapper.update();
    const scenario = wrapper.find('mock-Scenario');
    const control = scenario.prop('scenarioReviewControl') as React.ReactElement<{
      target: { type: 'TEXT_SCENARIO' };
      reviewState: LiveReviewCommentsLoadState;
    }>;
    await act(async () => {
      await control.props.reviewState.addComment({
        target: control.props.target,
        text: 'Clarify the expected result',
      });
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/test-case\/42\/review\/comment$/),
      expect.objectContaining({
        method: 'POST',
        data: { targetType: 'SCENARIO_TEXT', text: 'Clarify the expected result' },
      }),
    );
    expect(fetchMock.mock.calls.every(([url]) => /\/review(?:\/comment)?$/.test(url))).toBe(true);
    act(() => {
      wrapper.unmount();
    });
  });
});
