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

import type { ReactElement } from 'react';
import { shallow, type ShallowWrapper } from 'enzyme';

import { CollapsibleSectionWithHeaderControl } from 'components/collapsibleSection';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import { CriterionKey, EvaluationState } from 'types/aiFactory';

import { EvaluationPanel } from './evaluationPanel';
import {
  EvaluationContentState,
  type EvaluationContentStateProps,
} from './evaluationShared';
import { useRubricModal } from './useRubricModal';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: 'BubblesLoader',
  Button: 'Button',
  ChevronDownDropdownIcon: 'ChevronDownDropdownIcon',
  InfoIcon: 'InfoIcon',
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage: string },
      values: Record<string, string | number> = {},
    ) =>
      Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage,
      ),
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: unknown[]) =>
      classNames.filter((className) => typeof className === 'string').join(' '),
}));
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSectionWithHeaderControl: 'CollapsibleSectionWithHeaderControl',
}));
jest.mock('components/main/absRelTime', () => ({ AbsRelTime: 'AbsRelTime' }));
jest.mock('pages/inside/aiFactory/common', () => ({
  ScoreBar: 'ScoreBar',
  ScoreChip: 'ScoreChip',
}));
jest.mock('./useRubricModal', () => ({ useRubricModal: jest.fn() }));

const reload = jest.fn();
const openRubricModal = jest.fn();
const renderContent = (wrapper: ShallowWrapper) => {
  const props = wrapper.find('EvaluationContentState').props() as unknown as EvaluationContentStateProps;

  return shallow(<EvaluationContentState {...props} />);
};
const evaluatedState: TestCaseAiLoadState = {
  data: {
    pipelineLinks: [],
    lifecycleHistory: [],
    evaluation: {
      totalScore: 81,
      state: EvaluationState.EVALUATED,
      source: { iterationId: 101, iterationNumber: 1 },
      evaluatedAt: 1,
      criteria: [
        {
          key: CriterionKey.ATOMICITY,
          score: 8,
          maxScore: 15,
          failureReasons: ['Contains two independently testable behaviors.'],
        },
      ],
    },
  },
  isLoading: false,
  isError: false,
  reload,
};

describe('EvaluationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRubricModal).mockReturnValue({ openModal: openRubricModal });
  });

  test('renders the total, criterion, source, and expandable failure reasons', () => {
    const wrapper = shallow(<EvaluationPanel aiDetailsState={evaluatedState} />);
    const content = renderContent(wrapper);

    expect(wrapper.find(CollapsibleSectionWithHeaderControl).prop('isInitiallyExpanded')).toBe(
      true,
    );
    expect(content.text()).toContain('81/ 100Evaluated');
    expect(content.text()).toContain('Iteration #1');

    const criterionProps = wrapper.find('CriterionRow').props();
    expect(criterionProps).toMatchObject({
      criterion: expect.objectContaining({
        key: CriterionKey.ATOMICITY,
        score: 8,
        maxScore: 15,
        failureReasons: ['Contains two independently testable behaviors.'],
      }),
      isExpanded: false,
    });

    (criterionProps.onToggle as () => void)();
    wrapper.setProps({});
    expect(wrapper.find('CriterionRow').prop('isExpanded')).toBe(true);
  });

  test('renders the obsolete state without a pass or fail verdict', () => {
    const aiDetailsState = {
      ...evaluatedState,
      data: {
        ...evaluatedState.data,
        evaluation: {
          ...evaluatedState.data?.evaluation,
          state: EvaluationState.OBSOLETE,
        },
      },
    } as TestCaseAiLoadState;
    const wrapper = shallow(<EvaluationPanel aiDetailsState={aiDetailsState} />);
    const content = renderContent(wrapper);

    expect(content.text()).toContain('Obsolete');
    expect(content.text()).toContain('Obsolete — scenario changed after evaluation');
    expect(content.text()).not.toContain('PASS');
    expect(content.text()).not.toContain('FAIL');
  });

  test('renders an accessible loading state', () => {
    const wrapper = shallow(
      <EvaluationPanel aiDetailsState={{ ...evaluatedState, data: null, isLoading: true }} />,
    );
    const content = renderContent(wrapper);

    expect(content.find('output').prop('aria-label')).toBe('Loading AI evaluation');
  });

  test('renders an error and retries the shared request', () => {
    const wrapper = shallow(
      <EvaluationPanel aiDetailsState={{ ...evaluatedState, data: null, isError: true }} />,
    );
    const content = renderContent(wrapper);

    expect(content.find('[role="alert"]').text()).toContain('AI evaluation could not be loaded');
    const retryButton = content.find('[data-automation-id="retry-ai-evaluation"]').props();
    (retryButton.onClick as () => void)();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('opens rubric help from the section header', () => {
    const wrapper = shallow(<EvaluationPanel aiDetailsState={evaluatedState} />);
    const headerControl = wrapper
      .find(CollapsibleSectionWithHeaderControl)
      .prop('headerControlComponent');
    const helpButton = shallow(headerControl as ReactElement);

    (helpButton.props().onClick as () => void)();
    expect(openRubricModal).toHaveBeenCalledWith({
      criteria: [{ key: CriterionKey.ATOMICITY, maxScore: 15 }],
    });
  });
});
