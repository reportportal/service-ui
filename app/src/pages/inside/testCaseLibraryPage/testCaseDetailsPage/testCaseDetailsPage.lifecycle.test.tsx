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
import { projectKeySelector } from 'controllers/project';
import { isLoadingTestCaseDetailsSelector, testCaseDetailsSelector } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { LifecycleHistory, useTestCaseAi } from 'pages/inside/aiFactory/lifecycle';
import { EvaluationPanel } from 'pages/inside/aiFactory/evaluation';
import { GenerationCost } from 'pages/inside/aiFactory/generationCost';
import { PipelineLinks } from 'pages/inside/aiFactory/pipelineLinks';
import { useAddTestCasesToTestPlanModal } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { Lifecycle } from 'types/aiFactory';
import type { ExtendedTestCase } from 'types/testCase';

import { useDescriptionModal } from './descriptionModal';
import { TestCaseDetailsPage } from './testCaseDetailsPage';
import { useTestCaseTags } from './useTestCaseTags';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: 'BubblesLoader',
  Button: 'Button',
  EditIcon: 'EditIcon',
  PlusIcon: 'PlusIcon',
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
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
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
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/testCase', () => ({
  isLoadingTestCaseDetailsSelector: jest.fn(),
  testCaseDetailsSelector: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/evaluation', () => ({ EvaluationPanel: 'EvaluationPanel' }));
jest.mock('pages/inside/aiFactory/generationCost', () => ({ GenerationCost: 'GenerationCost' }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/inside/aiFactory/lifecycle', () => ({
  LifecycleHistory: 'LifecycleHistory',
  useTestCaseAi: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/pipelineLinks', () => ({ PipelineLinks: 'PipelineLinks' }));
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

const renderPage = (isEnabled: boolean) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useSelector).mockImplementation((selector) => {
    if (selector === testCaseDetailsSelector) return selectedTestCase;
    if (selector === isLoadingTestCaseDetailsSelector) return false;
    if (selector === projectKeySelector) return 'demo';
    return undefined;
  });
  jest.mocked(useUserPermissions).mockReturnValue({
    canManageTestCases: false,
  } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useAddTestCasesToTestPlanModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useDescriptionModal).mockReturnValue({ openModal: jest.fn() });
  jest.mocked(useTestCaseAi).mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
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
    selectedTestCase = testCase;
  });

  test('does not mount History while the feature is disabled', () => {
    const wrapper = renderPage(false);

    expect(wrapper.find(LifecycleHistory)).toHaveLength(0);
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
});
