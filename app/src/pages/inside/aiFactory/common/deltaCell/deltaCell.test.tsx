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
import { formatCost } from 'common/utils';
import { DeltaCell } from './deltaCell';

describe('DeltaCell', () => {
  test('a higher score is "better" (green) when higherIsBetter is true', () => {
    const wrapper = shallow(<DeltaCell value={4} higherIsBetter />);

    expect(wrapper.text()).toBe('+4');
    expect(wrapper.hasClass('better')).toBe(true);
  });

  test('a lower score is "worse" (red) when higherIsBetter is true', () => {
    const wrapper = shallow(<DeltaCell value={-4} higherIsBetter />);

    expect(wrapper.text()).toBe('−4');
    expect(wrapper.hasClass('worse')).toBe(true);
  });

  test('a cost increase is "worse" (red) when higherIsBetter is false, using the format fn', () => {
    const wrapper = shallow(
      <DeltaCell value={0.13} higherIsBetter={false} format={formatCost} />,
    );

    expect(wrapper.text()).toBe('+$0.13');
    expect(wrapper.hasClass('worse')).toBe(true);
  });

  test('a cost decrease is "better" (green) when higherIsBetter is false', () => {
    const wrapper = shallow(
      <DeltaCell value={-0.13} higherIsBetter={false} format={formatCost} />,
    );

    expect(wrapper.text()).toBe('−$0.13');
    expect(wrapper.hasClass('better')).toBe(true);
  });

  test('zero is neutral with no sign', () => {
    const wrapper = shallow(<DeltaCell value={0} higherIsBetter />);

    expect(wrapper.text()).toBe('0');
    expect(wrapper.hasClass('neutral')).toBe(true);
  });
});
