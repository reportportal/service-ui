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

import { CostLabel, ScoreBar } from 'pages/inside/aiFactory/common';
import { AiIterationLink } from 'pages/inside/aiFactory/library/aiQualityCell';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import { CriterionKey, EvaluationState } from 'types/aiFactory';

import { EvaluationMini } from './evaluationMini';

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: 'BubblesLoader', Button: 'Button' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }, values?: Record<string, unknown>) => {
      const number = values?.number;

      return typeof number === 'number' || typeof number === 'string'
        ? message.defaultMessage.replace('{number}', String(number))
        : message.defaultMessage;
    },
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/collapsibleSection', () => ({ CollapsibleSection: 'CollapsibleSection' }));
jest.mock('pages/inside/aiFactory/common', () => ({
  CostLabel: 'CostLabel',
  ScoreBar: 'ScoreBar',
}));
jest.mock('pages/inside/aiFactory/library/aiQualityCell', () => ({
  AiIterationLink: 'AiIterationLink',
}));

const iteration = { pipelineId: 17, iterationId: 103, number: 4 };
const reload = jest.fn();
const readyState: TestCaseAiLoadState = {
  data: {
    evaluation: {
      totalScore: 81,
      state: EvaluationState.EVALUATED,
      source: { iterationId: 103, iterationNumber: 4 },
      evaluatedAt: 1,
      criteria: [
        { key: CriterionKey.COHERENCE, score: 8, maxScore: 10, failureReasons: [] },
        { key: CriterionKey.ATOMICITY, score: 14, maxScore: 15, failureReasons: [] },
      ],
    },
    cost: {
      approxTotal: 0.54,
      iterationShare: { iterationNumber: 4, amount: 0.32, iterationBaseCost: 3.2, casesCount: 10 },
      fixRounds: [],
      tokens: { input: 1, cacheRead: 2, cacheWrite: 3, output: 4 },
      model: 'model',
    },
    pipelineLinks: [],
    lifecycleHistory: [],
  },
  isLoading: false,
  isError: false,
  reload,
};

describe('EvaluationMini', () => {
  beforeEach(() => {
    reload.mockClear();
  });

  test('renders ordered criterion bars, cost, and source iteration link', () => {
    const wrapper = shallow(<EvaluationMini aiDetailsState={readyState} iteration={iteration} />);

    expect(wrapper.find(ScoreBar)).toHaveLength(2);
    expect(wrapper.text().indexOf('Atomicity')).toBeLessThan(wrapper.text().indexOf('Coherence'));
    expect(wrapper.find(CostLabel).prop('amount')).toBe(0.54);
    expect(wrapper.find(AiIterationLink).prop('iteration')).toEqual(iteration);
  });

  test('renders the loading state accessibly', () => {
    const wrapper = shallow(
      <EvaluationMini
        aiDetailsState={{ data: null, isLoading: true, isError: false, reload }}
        iteration={iteration}
      />,
    );

    expect(wrapper.find('output').prop('aria-label')).toBe('Loading AI evaluation');
  });

  test('renders an error with retry', () => {
    const wrapper = shallow(
      <EvaluationMini
        aiDetailsState={{ data: null, isLoading: false, isError: true, reload }}
        iteration={iteration}
      />,
    );

    const handleRetry = wrapper.find('Button').prop('onClick') as () => void;
    handleRetry();

    expect(wrapper.find('[role="alert"]')).toHaveLength(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
