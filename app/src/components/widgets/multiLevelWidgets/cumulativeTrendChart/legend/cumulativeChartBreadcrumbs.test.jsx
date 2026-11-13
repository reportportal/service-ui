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
import { CumulativeChartBreadcrumbs } from './cumulativeChartBreadcrumbs';

const attributes = ['build', 'platform'];
const drilledIn = { key: 'build', value: '5.9' };
// the svg mock renders as text inside the icon
const textWithoutIcons = (wrapper) =>
  wrapper
    .find('.icon')
    .reduce((text, icon) => text.replace(icon.text(), ''), wrapper.text());

describe('CumulativeChartBreadcrumbs', () => {
  test('shows only the first attribute key before a drill-down', () => {
    const wrapper = mount(<CumulativeChartBreadcrumbs attributes={attributes} activeAttribute={null} />);

    expect(wrapper.text()).toBe('build');
    expect(wrapper.find('.icon')).toHaveLength(0);
  });

  test('shows the drilled-down item, an arrow and the key of the level shown now', () => {
    const wrapper = mount(
      <CumulativeChartBreadcrumbs
        attributes={attributes}
        activeAttribute={drilledIn}
        activeAttributes={[drilledIn]}
      />,
    );

    expect(textWithoutIcons(wrapper)).toBe('build: 5.9platform');
    expect(wrapper.find('.icon')).toHaveLength(1);
  });

  test('has no trailing arrow when there is no further level', () => {
    const wrapper = mount(
      <CumulativeChartBreadcrumbs
        attributes={['build']}
        activeAttribute={drilledIn}
        activeAttributes={[drilledIn]}
      />,
    );

    expect(wrapper.text()).toBe('build: 5.9');
    expect(wrapper.find('.icon')).toHaveLength(0);
  });

  test('goes back to the top level when the drilled-down key is clicked', () => {
    const clearAttributes = jest.fn();
    const wrapper = mount(
      <CumulativeChartBreadcrumbs
        attributes={attributes}
        activeAttribute={drilledIn}
        activeAttributes={[drilledIn]}
        clearAttributes={clearAttributes}
      />,
    );

    wrapper.find('.link').simulate('click');

    expect(clearAttributes).toHaveBeenCalledTimes(1);
  });

  test('renders the key as plain text when static', () => {
    const wrapper = mount(
      <CumulativeChartBreadcrumbs
        attributes={attributes}
        activeAttribute={drilledIn}
        activeAttributes={[drilledIn]}
        isStatic
      />,
    );

    expect(wrapper.find('.link')).toHaveLength(0);
    expect(textWithoutIcons(wrapper)).toBe('build: 5.9platform');
  });
});
