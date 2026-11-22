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

import { mount } from 'enzyme';
import { fetch } from 'common/utils/fetch';
import { Image } from './image';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(),
  ERROR_CANCELED: 'canceled',
}));

describe('Image', () => {
  test('renders the src once a pending URL request becomes static', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    const wrapper = mount(<Image src="https://cdn/icon.png" />);

    expect(wrapper.find('img')).toHaveLength(0);

    wrapper.setProps({ src: 'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E', isStatic: true });
    wrapper.update();

    expect(wrapper.find('img').prop('src')).toBe('data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E');
  });
});
