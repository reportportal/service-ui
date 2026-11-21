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
import { ItemPathTooltip } from './itemPathTooltip';

describe('ItemPathTooltip', () => {
  test('renders launch and parent names as text', () => {
    const testItem = {
      pathNames: {
        launchPathName: { name: 'Launch <b>x</b>', number: 3 },
        itemPaths: [{ name: 'List<String> should <img src=x> sort' }, { name: 'child' }],
      },
    };
    const wrapper = mount(<ItemPathTooltip testItem={testItem} />);
    const tooltip = wrapper.find('.text-tooltip');

    expect(tooltip.text()).toBe(
      'Launch: Launch <b>x</b> #3 \nParent 1: List<String> should <img src=x> sort \nParent 2: child',
    );
    expect(tooltip.find('img')).toHaveLength(0);
    expect(tooltip.find('b').map((node) => node.text())).toEqual([
      'Launch:',
      'Parent 1:',
      'Parent 2:',
    ]);
  });
});
