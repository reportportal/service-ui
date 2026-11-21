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
import { Grid } from './grid';
import { GridBody } from './gridBody';

const DATA = [{ id: 1 }, { id: 2 }];

describe('Grid', () => {
  test('renders the rows with GridBody by default', () => {
    const wrapper = shallow(<Grid data={DATA} nestedView />);

    expect(wrapper.find(GridBody).props()).toMatchObject({ data: DATA, nestedView: true });
  });

  test('renders the rows with renderBody from the same body props', () => {
    const renderBody = jest.fn(() => <div className="custom-body" />);
    const wrapper = shallow(<Grid data={DATA} nestedView renderBody={renderBody} expanded />);

    expect(wrapper.find(GridBody).exists()).toBe(false);
    expect(wrapper.find('.custom-body').exists()).toBe(true);
    expect(renderBody).toHaveBeenCalledWith(
      expect.objectContaining({
        data: DATA,
        nestedView: true,
        expanded: true,
        setHighlighting: expect.any(Function),
      }),
    );
  });

  test('does not render the rows while the first page is loading', () => {
    const renderBody = jest.fn(() => null);

    shallow(<Grid data={DATA} loading renderBody={renderBody} />);

    expect(renderBody).not.toHaveBeenCalled();
  });
});
