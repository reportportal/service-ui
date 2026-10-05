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
import { useSelector } from 'react-redux';

import { PROJECT_PIPELINE_ITERATION_PAGE } from 'controllers/pages';
import { CostLabel, ScoreChip } from 'pages/inside/aiFactory/common';
import { EvaluationState, StageKey } from 'types/aiFactory';

import { AiQualityCell } from './aiQualityCell';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }, values?: { number?: number }) =>
      message.defaultMessage.replace('{number}', String(values?.number)),
  }),
}));
jest.mock('redux-first-router-link', () => {
  const Link = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
  Link.displayName = 'Link';
  return Link;
});
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_ITERATION_PAGE: 'PROJECT_PIPELINE_ITERATION_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/common', () => ({
  CostLabel: Object.assign(() => <span />, { displayName: 'CostLabel' }),
  ScoreChip: Object.assign(() => <span />, { displayName: 'ScoreChip' }),
}));

const ai = {
  generatedByIteration: { pipelineId: 17, iterationId: 103, number: 4 },
  modifiedByAgent: false,
  factoryKey: 'spec::case',
};

describe('AiQualityCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSelector).mockReturnValue({
      organizationSlug: 'epam',
      projectSlug: 'reportportal',
    });
  });

  test.each([
    { description: 'AI origin is absent', props: { evaluationSummary: { totalScore: 75, state: EvaluationState.EVALUATED } } },
    { description: 'evaluation is absent', props: { ai } },
  ])('renders an em dash when $description', ({ props }) => {
    const wrapper = shallow(<AiQualityCell {...props} />);

    expect(wrapper.text()).toBe('—');
    expect(wrapper.find(ScoreChip)).toHaveLength(0);
    expect(wrapper.find('IterationLink')).toHaveLength(0);
  });

  test('renders an evaluated score without the obsolete state', () => {
    const wrapper = shallow(
      <AiQualityCell
        ai={ai}
        evaluationSummary={{ totalScore: 82, state: EvaluationState.EVALUATED }}
      />,
    );

    expect(wrapper.find(ScoreChip).props()).toEqual({ score: 82, obsolete: false });
  });

  test('passes the obsolete state to the score chip', () => {
    const wrapper = shallow(
      <AiQualityCell
        ai={ai}
        evaluationSummary={{ totalScore: 82, state: EvaluationState.OBSOLETE }}
      />,
    );

    expect(wrapper.find(ScoreChip).prop('obsolete')).toBe(true);
  });

  test('preserves zero score and zero cost values', () => {
    const wrapper = shallow(
      <AiQualityCell
        ai={ai}
        evaluationSummary={{ totalScore: 0, state: EvaluationState.EVALUATED }}
        costSummary={{ approxTotal: 0 }}
      />,
    );

    expect(wrapper.find(ScoreChip).prop('score')).toBe(0);
    expect(wrapper.find(CostLabel).prop('amount')).toBe(0);
  });

  test('omits the cost label when cost is absent', () => {
    const wrapper = shallow(
      <AiQualityCell
        ai={ai}
        evaluationSummary={{ totalScore: 82, state: EvaluationState.EVALUATED }}
      />,
    );

    expect(wrapper.find(CostLabel)).toHaveLength(0);
  });

  test('links the originating iteration to its Grade stage', () => {
    const wrapper = mount(
      <AiQualityCell
        ai={ai}
        evaluationSummary={{ totalScore: 82, state: EvaluationState.EVALUATED }}
      />,
    );
    const link = wrapper.find('Link');

    expect(link.prop('to')).toEqual({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug: 'epam',
        projectSlug: 'reportportal',
        pipelineId: 17,
        iterationId: 103,
      },
      query: { stage: StageKey.GRADE },
    });
    expect(link.prop('children')).toBe('Iteration #4 ↗');
  });
});
