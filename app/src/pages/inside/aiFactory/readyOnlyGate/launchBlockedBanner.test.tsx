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
import { SystemMessage } from '@reportportal/ui-kit';

import { LaunchBlockedBanner } from './launchBlockedBanner';

jest.mock('@reportportal/ui-kit', () => ({ SystemMessage: 'SystemMessage' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage?: string },
      values: { plans: string },
    ) => message.defaultMessage?.replace('{plans}', values.plans),
  }),
}));

describe('LaunchBlockedBanner', () => {
  test('names every Test Plan blocked by the Draft case', () => {
    const wrapper = shallow(
      <LaunchBlockedBanner
        plans={[
          { id: 1, name: 'Regression' },
          { id: 2, name: 'Release smoke' },
        ]}
      />,
    );

    expect(wrapper.find(SystemMessage).text()).toBe(
      'In plan · Launch blocked — Regression, Release smoke',
    );
  });

  test('renders nothing when the case blocks no Test Plans', () => {
    expect(shallow(<LaunchBlockedBanner plans={[]} />).html()).toBeNull();
  });
});
