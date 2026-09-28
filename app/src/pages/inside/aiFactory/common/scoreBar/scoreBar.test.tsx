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
import { ScoreBar } from './scoreBar';

describe('ScoreBar', () => {
  test('sets the indicator width to the value/max percentage', () => {
    const wrapper = shallow(<ScoreBar value={7} max={10} />);

    expect(wrapper.find('.score-bar__indicator').prop('style')).toEqual({ width: '70%' });
  });

  test('clamps above max at 100%', () => {
    const wrapper = shallow(<ScoreBar value={15} max={10} />);

    expect(wrapper.find('.score-bar__indicator').prop('style')).toEqual({ width: '100%' });
  });

  test('clamps negative values at 0%', () => {
    const wrapper = shallow(<ScoreBar value={-5} max={10} />);

    expect(wrapper.find('.score-bar__indicator').prop('style')).toEqual({ width: '0%' });
  });

  test('renders 0% when max is 0', () => {
    const wrapper = shallow(<ScoreBar value={0} max={0} />);

    expect(wrapper.find('.score-bar__indicator').prop('style')).toEqual({ width: '0%' });
  });
});
