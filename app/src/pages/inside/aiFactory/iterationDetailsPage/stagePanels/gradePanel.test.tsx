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

import { CriterionKey, StageKey, StageStatus, type StageRS } from 'types/aiFactory';

import { GradePanel } from './gradePanel';

jest.mock('@reportportal/ui-kit', () => ({
  ChevronDownDropdownIcon: 'ChevronDownDropdownIcon',
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }, values?: Record<string, string>) =>
      message.defaultMessage.replace('{name}', values?.name ?? ''),
  }),
}));

describe('GradePanel', () => {
  test('uses a labelled native disclosure linked to its details row', () => {
    const stage = {
      key: StageKey.GRADE,
      status: StageStatus.PASSED,
      cost: 0,
      tokens: [],
      grade: {
        suiteScore: 90,
        warnings: [],
        cases: [
          {
            name: 'Checkout',
            totalScore: 90,
            criteria: [
              {
                key: CriterionKey.ATOMICITY,
                score: 10,
                maxScore: 10,
                failureReasons: [],
              },
            ],
          },
        ],
      },
    } as StageRS;
    const wrapper = shallow(<GradePanel stage={stage} />);
    const toggle = wrapper.find('button');
    const detailsId = toggle.prop('aria-controls');

    expect(toggle.props()).toMatchObject({
      type: 'button',
      'aria-label': 'Toggle score details for Checkout',
      'aria-expanded': false,
    });
    expect(wrapper.find('[data-automation-id="gradeRowDetails-Checkout"]').props()).toMatchObject({
      id: detailsId,
      hidden: true,
    });

    (toggle.prop('onClick') as () => void)();
    expect(wrapper.find('button').prop('aria-expanded')).toBe(true);
    expect(wrapper.find('[data-automation-id="gradeRowDetails-Checkout"]').props()).toMatchObject({
      id: detailsId,
      hidden: false,
    });
  });
});
