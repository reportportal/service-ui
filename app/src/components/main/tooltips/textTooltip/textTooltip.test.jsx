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
import { TextTooltip } from './textTooltip';

describe('TextTooltip', () => {
  test('renders plain text content verbatim when parsing is prevented', () => {
    const wrapper = mount(<TextTooltip tooltipContent="List<String> <img src=x>" preventParsing />);

    expect(wrapper.text()).toBe('List<String> <img src=x>');
    expect(wrapper.find('img')).toHaveLength(0);
  });

  test('renders sanitised HTML with links opening in a new tab', () => {
    const wrapper = mount(
      <TextTooltip
        tooltipContent={'<b>bold</b> <a href="https://example.com">doc</a><form></form>'}
      />,
    );
    const link = wrapper.find('a');

    expect(wrapper.find('b').text()).toBe('bold');
    expect(wrapper.find('form')).toHaveLength(0);
    expect(link.prop('target')).toBe('_blank');
    expect(link.prop('rel')).toBe('noopener noreferrer');
  });
});
