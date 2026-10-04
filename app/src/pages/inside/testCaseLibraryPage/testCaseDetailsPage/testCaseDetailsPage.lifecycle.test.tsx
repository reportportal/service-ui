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
import { useSelector } from 'react-redux';

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
import { PipelineLinks } from 'pages/inside/aiFactory/pipelineLinks';
import { LaunchBlockedBanner } from 'pages/inside/aiFactory/readyOnlyGate';
import { ReviewStrip, useFixRound, useReviewComments } from 'pages/inside/aiFactory/review';
import { useAddTestCasesToTestPlanModal } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { AutomationStatus, Lifecycle, type TestCaseAiRS } from 'types/aiFactory';
import type { ExtendedTestCase } from 'types/testCase';

import { useDescriptionModal } from './descriptionModal';
import { TestCaseDetailsPage } from './testCaseDetailsPage';
import { useTestCaseTags } from './useTestCaseTags';
import { checkScenario } from './utils';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: 'BubblesLoader',
  Button: 'Button',
  EditIcon: 'EditIcon',
  PlusIcon: 'PlusIcon',
  SystemMessage: 'SystemMessage',
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
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSectionWithHeaderControl: 'CollapsibleSectionWithHeaderControl',
}));
jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: 'ExpandedTextSection',
}));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'ScrollWrapper' }));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'SettingsLayout' }));
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
jest.mock('pages/inside/aiFactory/evaluation', () => ({ EvaluationPanel: 'EvaluationPanel' }));
jest.mock('pages/inside/aiFactory/generationCost', () => ({ GenerationCost: 'GenerationCost' }));
jest.mock('pages/inside/aiFactory/automation', () => ({ AutomationSection: 'AutomationSection' }));
jest.mock('pages/inside/aiFactory/common', () => ({ usePolling: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/inside/aiFactory/lifecycle', () => ({
  LifecycleHistory: 'LifecycleHistory',
  useTestCaseAi: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/pipelineLinks', () => ({ PipelineLinks: 'PipelineLinks' }));
jest.mock('pages/inside/aiFactory/review', () => ({
  ReviewStrip: 'ReviewStrip',
  ReviewTarget: 'ReviewTarget',
  useFixRound: jest.fn(),
  useReviewComments: jest.fn(),
}));
jest.mock('pages/inside/common/attachmentsWithSlider', () => ({
  AttachmentsWithSlider: 'AttachmentsWithSlider',
}));
jest.mock('pages/inside/common/requirementsList/requirementsList', () => ({
  RequirementsList: 'RequirementsList',
}));
jest.mock('pages/inside/common/scenario', () => ({ Scenario: 'Scenario' }));
jest.mock('pages/inside/common/scenarioUtils', () => ({
  hasScenarioContent: jest.fn(() => false),
  hasStepContent: jest.fn(() => false),
  hasStepsPreconditionContent: jest.fn(() => false),
}));
jest.mock('pages/inside/productVersionPage/linkedTestCasesTab/tagList', () => ({
  AdaptiveTagList: 'AdaptiveTagList',
}));
jest.mock(
  'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal',
  () => ({ useAddTestCasesToTestPlanModal: jest.fn() }),
);
jest.mock('./descriptionModal', () => ({ useDescriptionModal: jest.fn() }));
jest.mock('./precondition', () => ({ Precondition: 'Precondition' }));
jest.mock('./stepsList', () => ({ StepsList: 'StepsList' }));
jest.mock('./testCaseDetailsHeader', () => ({ TestCaseDetailsHeader: 'TestCaseDetailsHeader' }));
jest.mock('./useTestCaseTags', () => ({ useTestCaseTags: jest.fn() }));
jest.mock('./utils', () => ({ checkScenario: jest.fn(() => true) }));
jest.mock('../emptyState/details/detailsEmptyState', () => ({
  DetailsEmptyState: 'DetailsEmptyState',
}));
jest.mock('../tagPopover', () => ({ TagPopover: 'TagPopover' }));

const testCase = {
  id: 42,
  name: 'Lifecycle case',
  description: '',
  attributes: [],
  lifecycle: Lifecycle.DRAFT,
  updatedAt: 100,
  manualScenario: {},
} as unknown as ExtendedTestCase;

let selectedTestCase = testCase;
let selectedAiDetails: TestCaseAiRS | null = null;
let testCaseDetailsLoading = false;
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
  } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useAddTestCasesToTestPlanModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useDescriptionModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useTestCaseAi).mockReturnValue({
    data: selectedAiDetails,
    isLoading: false,
    isError: false,
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
    expect(enabledPage.find(ReviewStrip)).toHaveLength(1);
    expect(disabledPage.find(ReviewStrip)).toHaveLength(0);
  });
});
