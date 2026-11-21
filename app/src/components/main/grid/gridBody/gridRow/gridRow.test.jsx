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

import { act } from 'react';
import { mount } from 'enzyme';
import { LOG_MESSAGE_HIGHLIGHT_TIMEOUT } from '../../constants';
import { GridRow } from './gridRow';

jest.mock('react-tracking', () => () => (Component) => Component);

const TIMEOUT = LOG_MESSAGE_HIGHLIGHT_TIMEOUT;

const Cell = () => <div />;

const render = (props = {}) =>
  mount(
    <GridRow
      columns={[{ id: 'cell', component: Cell, maxHeight: 200 }]}
      value={{ id: 5 }}
      tracking={{ trackEvent: jest.fn() }}
      {...props}
    />,
  );

describe('GridRow', () => {
  let scrollIntoView;
  const consoleError = console.error;

  beforeAll(() => {
    // the row renders <tr> elements inside of a <div> (a known quirk of the markup, not under test)
    console.error = (message, ...rest) => {
      if (!/validateDOMNesting/.test(message)) {
        consoleError(message, ...rest);
      }
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('highlight', () => {
    const highlighted = (extra = {}) => ({
      rowHighlightingConfig: {
        highlightedRowId: 5,
        isGridRowHighlighted: true,
        onGridRowHighlighted: jest.fn(),
      },
      setHighlighting: jest.fn(),
      ...extra,
    });

    test('does not run on mount by default', () => {
      const props = highlighted();
      render(props);

      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(props.setHighlighting).not.toHaveBeenCalled();
    });

    test('runs on mount when highlightOnMount is set and the row is the highlighted one', () => {
      const props = highlighted({ highlightOnMount: true });
      render(props);

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      expect(props.setHighlighting).toHaveBeenCalledWith(true);

      jest.advanceTimersByTime(TIMEOUT);
      expect(props.rowHighlightingConfig.onGridRowHighlighted).toHaveBeenCalledTimes(1);
      expect(props.setHighlighting).toHaveBeenLastCalledWith(false);
    });

    test('does not run on mount for another row', () => {
      render(highlighted({ highlightOnMount: true, value: { id: 6 } }));

      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    test('does not scroll when scrollOnHighlight is false but still finishes the highlight', () => {
      const props = highlighted({ highlightOnMount: true, scrollOnHighlight: false });
      render(props);

      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(props.setHighlighting).toHaveBeenCalledWith(true);

      jest.advanceTimersByTime(TIMEOUT);
      expect(props.rowHighlightingConfig.onGridRowHighlighted).toHaveBeenCalledTimes(1);
    });

    test('still runs on update when the row becomes highlighted', () => {
      const wrapper = render({
        rowHighlightingConfig: { highlightedRowId: 5, isGridRowHighlighted: false },
        setHighlighting: jest.fn(),
      });
      wrapper.setProps({
        rowHighlightingConfig: { highlightedRowId: 5, isGridRowHighlighted: true },
      });

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  describe('expanded state', () => {
    const toggle = (wrapper) => {
      wrapper.instance().overflowCell = document.createElement('div');
      act(() => {
        wrapper.instance().toggleAccordion();
      });
      wrapper.update();
    };

    test('uses the "expanded" prop when there is no initial state to restore', () => {
      expect(render({ expanded: true }).state('expanded')).toBe(true);
      expect(render().state('expanded')).toBe(false);
    });

    test('restores initialExpanded in preference to the "expanded" prop', () => {
      expect(render({ expanded: false, initialExpanded: true }).state('expanded')).toBe(true);
      expect(render({ expanded: true, initialExpanded: false }).state('expanded')).toBe(false);
    });

    test('reports toggling with the row id and the new state', () => {
      const onExpandedChange = jest.fn();
      const wrapper = render({ onExpandedChange });

      toggle(wrapper);
      expect(onExpandedChange).toHaveBeenLastCalledWith(5, true);

      toggle(wrapper);
      expect(onExpandedChange).toHaveBeenLastCalledWith(5, false);
    });

    test('reports the new state when the "expanded" prop changes', () => {
      const onExpandedChange = jest.fn();
      const wrapper = render({ onExpandedChange });

      wrapper.setProps({ expanded: true });

      expect(onExpandedChange).toHaveBeenCalledWith(5, true);
      expect(wrapper.state('expanded')).toBe(true);
    });

    test('works without onExpandedChange', () => {
      const wrapper = render();

      expect(() => toggle(wrapper)).not.toThrow();
      expect(wrapper.state('expanded')).toBe(true);
    });
  });
});
