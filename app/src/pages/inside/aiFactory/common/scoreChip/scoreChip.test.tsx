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

import type { ReactNode } from 'react';
import { shallow } from 'enzyme';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
import { ScoreChip } from './scoreChip';

// jest.requireActual's generic defaults to `any` — the standard Jest idiom for partial mocks.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

// `ConditionalTooltip` pulls in the ESM-only `@reportportal/ui-kit` build, which Jest cannot
// transform; the component itself isn't under test here, so it is replaced with a passthrough.
jest.mock('components/main/conditionalTooltip', () => ({
  ConditionalTooltip: ({ children }: { children: ReactNode }) => children,
}));

describe('ScoreChip', () => {
  test('renders the score with a star prefix', () => {
    const wrapper = shallow(<ScoreChip score={47} />);

    expect(wrapper.find('[data-automation-id="scoreChip"]').text()).toBe('★ 47');
  });

  test('has no tooltip when not obsolete', () => {
    const wrapper = shallow(<ScoreChip score={47} />);

    expect(wrapper.find(ConditionalTooltip).prop('content')).toBeUndefined();
  });

  test('shows an obsolete-evaluation tooltip when obsolete', () => {
    const wrapper = shallow(<ScoreChip score={47} obsolete />);

    expect(wrapper.find(ConditionalTooltip).prop('content')).toBe(
      'Evaluation is obsolete after a scenario edit',
    );
  });
});
