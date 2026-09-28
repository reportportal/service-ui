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
import { Lifecycle } from 'types/aiFactory';
import { LifecycleBadge } from './lifecycleBadge';

// jest.requireActual's generic defaults to `any` — the standard Jest idiom for partial mocks.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

describe('LifecycleBadge', () => {
  test('renders "Draft" for Lifecycle.DRAFT', () => {
    const wrapper = shallow(<LifecycleBadge lifecycle={Lifecycle.DRAFT} />);

    expect(wrapper.text()).toBe('Draft');
  });

  test('renders "Ready" for Lifecycle.READY', () => {
    const wrapper = shallow(<LifecycleBadge lifecycle={Lifecycle.READY} />);

    expect(wrapper.text()).toBe('Ready');
  });
});
