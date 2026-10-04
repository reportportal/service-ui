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

import { StageKey, StageStatus, type StageRS } from 'types/aiFactory';

import { StageCards } from './stageCards';

jest.mock('pages/inside/aiFactory/common', () => ({
  STAGE_LABEL_MESSAGE: {
    CREATE: { defaultMessage: 'Create' },
    GRADE: { defaultMessage: 'Grade' },
  },
  StageStatusDot: 'StageStatusDot',
  StageStatusLabel: 'StageStatusLabel',
  stageMetric: jest.fn(() => null),
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

describe('StageCards', () => {
  test('exposes the selected stage and keeps connector arrows decorative', () => {
    const onSelect = jest.fn();
    const stages = [
      { key: StageKey.CREATE, status: StageStatus.PASSED, cost: 0, tokens: [] },
      { key: StageKey.GRADE, status: StageStatus.RUNNING, cost: 0, tokens: [] },
    ] as StageRS[];
    const wrapper = shallow(
      <StageCards
        stages={stages}
        testCasesCount={1}
        selectedStage={StageKey.CREATE}
        onSelect={onSelect}
      />,
    );

    const createButton = wrapper.find('[data-automation-id="stageCard-CREATE"]');
    const gradeButton = wrapper.find('[data-automation-id="stageCard-GRADE"]');
    expect(createButton.prop('aria-pressed')).toBe(true);
    expect(gradeButton.prop('aria-pressed')).toBe(false);
    expect(wrapper.find('.stage-cards__arrow').prop('aria-hidden')).toBe('true');

    (gradeButton.prop('onClick') as () => void)();
    expect(onSelect).toHaveBeenCalledWith(StageKey.GRADE);
  });
});
