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
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { FAILED } from 'common/constants/testStatuses';
import { Grid } from 'components/main/grid';
import { GridRow } from 'components/main/grid/gridBody/gridRow';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { ScrollContainerContext } from 'components/main/scrollWrapper';
import { LogsPageContainer } from 'pages/inside/logsPage/logsPageContainer';
import { PREVIOUS } from 'controllers/log';
import {
  nestedStepsReducer,
  requestNestedStepAction,
  loadMoreNestedStepAction,
} from 'controllers/log/nestedSteps';
import { NestedStepHeader } from '../nestedStepHeader';
import { LogsGridBody } from './logsGridBody';

jest.mock('react-tracking', () => {
  const tracking = { trackEvent: () => {}, getTrackingData: () => ({}) };
  return {
    __esModule: true,
    default: () => (Component) => (props) => <Component tracking={tracking} {...props} />,
    useTracking: () => tracking,
  };
});
jest.mock('pages/inside/common/durationBlock', () => ({ DurationBlock: () => null }));
jest.mock('pages/inside/common/testItemStatus', () => ({ TestItemStatus: () => null }));
jest.mock('components/main/markdown', () => ({ MarkdownViewer: () => null }));
// the real page container renders the grid in place of the whole logs page
let mockLogsPageContent = null;
jest.mock('pages/inside/logsPage/logsPage', () => ({ LogsPage: () => mockLogsPageContent }));

// jsdom has no layout: the fake virtualiser lays the rows out with their estimated sizes and
// renders the rows of mockRange ([first, last] indexes, all rows when null)
let mockRange = null;
const mockVirtualizer = {
  scrollToIndex: jest.fn(),
  measure: jest.fn(),
  measureElement: jest.fn(),
};
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options) => {
    const margin = options.scrollMargin || 0;
    let end = margin;
    const items = Array.from({ length: options.count }, (_, index) => {
      const size = options.estimateSize(index);
      const item = { index, key: options.getItemKey(index), start: end, end: end + size, size };
      end += size;
      return item;
    });
    return Object.assign(mockVirtualizer, {
      options,
      measurementsCache: items,
      getVirtualItems: () => (mockRange ? items.slice(mockRange[0], mockRange[1] + 1) : items),
      getTotalSize: () => end - margin,
    });
  },
}));

const log = (id) => ({ id, message: `log ${id}` });
const step = (id, status) => ({ id, name: `step ${id}`, hasContent: true, status });
const page = (first, last, total) => ({
  number: last,
  firstNumber: first,
  totalPages: total,
  size: 300,
  totalElements: total * 300,
  loaded: (last - first + 1) * 300,
});
const loadedStep = (content, pageData = page(1, 1, 1)) => ({
  collapsed: false,
  loading: false,
  initial: false,
  content,
  page: pageData,
});

const DATA = [log(1), step(10), log(2)];
const NESTED_STEPS = { 10: loadedStep([log(11), log(12)], page(2, 2, 2)) };
// row indexes: 0 log 1, 1 step 10, 2 load previous, 3 log 11, 4 log 12, 5 log 2
const EVENTS_INFO = {
  getClickOnLoadMore: (direction) => ({ loadMore: direction }),
  clickOnLoadCurrentStep: {},
};

const StepHeader = ({ data, measureRef, dataIndex }) => (
  <div className="step-header" data-step={data.id} ref={measureRef} data-index={dataIndex} />
);
StepHeader.propTypes = {
  data: PropTypes.object.isRequired,
  measureRef: PropTypes.func,
  dataIndex: PropTypes.number,
};
StepHeader.defaultProps = {
  measureRef: null,
  dataIndex: undefined,
};

const Cell = ({ value }) => <span>{value.message}</span>;
Cell.propTypes = {
  value: PropTypes.object.isRequired,
};

const createTestStore = (nestedSteps = NESTED_STEPS) => {
  const actions = [];
  const recorder = () => (next) => (action) => {
    actions.push(action);
    return next(action);
  };
  const store = createStore(
    combineReducers({ log: combineReducers({ nestedSteps: nestedStepsReducer }) }),
    { log: { nestedSteps } },
    applyMiddleware(recorder),
  );
  return { store, actions };
};

const scrollContainer = { current: document.createElement('div') };

const GridUnderTest = ({ store, ...props }) => (
  <Provider store={store}>
    <IntlProvider locale="en" onError={() => {}}>
      <ScrollContainerContext.Provider value={scrollContainer}>
        <div id="root">
          <Grid
            columns={[{ id: 'message', component: Cell }]}
            data={DATA}
            nestedView
            nestedStepHeader={StepHeader}
            eventsInfo={EVENTS_INFO}
            renderBody={(bodyProps) => <LogsGridBody {...bodyProps} />}
            {...props}
          />
        </div>
      </ScrollContainerContext.Provider>
    </IntlProvider>
  </Provider>
);
GridUnderTest.propTypes = {
  store: PropTypes.object.isRequired,
};

const mountGrid = (store, props = {}) => mount(<GridUnderTest store={store} {...props} />);

const rowIds = (wrapper) =>
  Array.from(
    wrapper.find('#root').getDOMNode().querySelectorAll('.grid-row-wrapper, .step-header'),
  ).map((element) => +(element.dataset.id || element.dataset.step));
const spacers = (wrapper) =>
  Array.from(wrapper.find('#root').getDOMNode().querySelectorAll('.spacer'));
const findRow = (wrapper, id) =>
  wrapper.find(GridRow).filterWhere((row) => row.prop('value').id === id);

describe('LogsGridBody in the page layout', () => {
  const consoleError = console.error;

  beforeAll(() => {
    // the rows render table cells inside of <div> elements (a known quirk of the markup)
    console.error = (message, ...rest) => {
      if (!/validateDOMNesting|cannot appear as a child of|cannot be a child of/.test(message)) {
        consoleError(message, ...rest);
      }
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  beforeEach(() => {
    mockRange = null;
    mockVirtualizer.scrollOffset = null;
    scrollContainer.current.scrollTop = 0;
    mockVirtualizer.scrollToIndex.mockClear();
    mockVirtualizer.measure.mockClear();
    mockVirtualizer.measureElement.mockClear();
    mockVirtualizer.elementsCache = new Map();
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('virtualises the rows with the keys and sizes of the row model', () => {
    mountGrid(createTestStore().store, { logsSize: 'small' });
    const { options } = mockVirtualizer;

    expect(options.count).toBe(6);
    expect(options.overscan).toBe(20);
    expect(options.getScrollElement()).toBe(scrollContainer.current);
    expect([0, 1, 2].map(options.getItemKey)).toEqual([
      'log-1',
      'stepHeader-10',
      'loadPrevious-10',
    ]);
  });

  test('renders only the rows of the virtual window between two spacer rows', () => {
    mockRange = [3, 4];
    const wrapper = mountGrid(createTestStore().store);
    const [top, bottom] = spacers(wrapper);

    expect(rowIds(wrapper)).toEqual([11, 12]);
    // 36px log rows, 56px step header and 32px load row of the medium preset
    expect(top.style.height).toBe(`${36 + 56 + 32}px`);
    expect(bottom.style.height).toBe('36px');
    expect(top.getAttribute('aria-hidden')).toBe('true');
    expect(bottom.getAttribute('aria-hidden')).toBe('true');
  });

  test('lets the virtualiser measure every rendered row by its index', () => {
    const wrapper = mountGrid(createTestStore().store);
    const measured = mockVirtualizer.measureElement.mock.calls
      .map(([element]) => element)
      .filter(Boolean);

    expect(measured.map((element) => element.dataset.index)).toEqual(
      expect.arrayContaining(['0', '1', '2', '3', '4', '5']),
    );
    expect(wrapper.find('.load-more-row').getDOMNode().dataset.index).toBe('2');
  });

  test('scrolls to the highlighted row once and lets the row highlight itself without scrolling', () => {
    mockRange = [0, 1];
    const { store } = createTestStore();
    const wrapper = mountGrid(store);
    const highlight = { highlightedRowId: 12, isGridRowHighlighted: true };

    wrapper.setProps({ rowHighlightingConfig: highlight });
    wrapper.setProps({ rowHighlightingConfig: { ...highlight } });

    expect(mockVirtualizer.scrollToIndex).toHaveBeenCalledTimes(1);
    expect(mockVirtualizer.scrollToIndex).toHaveBeenCalledWith(4, { align: 'center' });

    // the virtualiser scrolled: the row is mounted and runs the highlight itself
    mockRange = null;
    wrapper.setProps({ rowHighlightingConfig: { ...highlight } });
    wrapper.update();

    expect(findRow(wrapper, 12).props()).toMatchObject({
      highlightOnMount: true,
      scrollOnHighlight: false,
    });
    expect(wrapper.find('.grid-row-wrapper[data-id=12] .highlight').exists()).toBe(true);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  test('scrolls to the same row again for the next highlight', () => {
    const wrapper = mountGrid(createTestStore().store);
    const highlight = { highlightedRowId: 1, isGridRowHighlighted: true };

    wrapper.setProps({ rowHighlightingConfig: highlight });
    wrapper.setProps({ rowHighlightingConfig: { ...highlight, isGridRowHighlighted: false } });
    wrapper.setProps({ rowHighlightingConfig: highlight });

    expect(mockVirtualizer.scrollToIndex).toHaveBeenCalledTimes(2);
  });

  test('scrolls to the highlighted row once it is loaded', () => {
    const { store } = createTestStore({});
    const wrapper = mountGrid(store);

    wrapper.setProps({
      rowHighlightingConfig: { highlightedRowId: 11, isGridRowHighlighted: true },
    });
    expect(mockVirtualizer.scrollToIndex).not.toHaveBeenCalled();

    // fetchLog opens the step with the log before the highlight
    act(() => {
      store.dispatch({ type: 'fetchNestedStepStartAction', payload: { id: 10 } });
      store.dispatch({
        type: 'fetchNestedStepSuccessAction',
        payload: { id: 10, content: [log(11)], page: page(1, 1, 1) },
      });
      store.dispatch({ type: 'toggleNestedStep', payload: { id: 10 } });
    });

    expect(mockVirtualizer.scrollToIndex).toHaveBeenCalledWith(2, { align: 'center' });
  });

  test('brings the first log of the step back into view after "load previous"', () => {
    const { store, actions } = createTestStore();
    const wrapper = mountGrid(store);

    wrapper.find('.load-more-row .load-button').first().simulate('click');
    expect(actions).toContainEqual(loadMoreNestedStepAction({ id: 10, loadDirection: PREVIOUS }));

    act(() => {
      store.dispatch({ type: 'fetchNestedStepStartAction', payload: { id: 10 } });
    });
    act(() => {
      store.dispatch({
        type: 'fetchNestedStepSuccessAction',
        payload: { id: 10, content: [log(7), log(8), log(11), log(12)], page: page(1, 2, 2) },
      });
    });

    // rows: log 1, step 10, log 7, log 8, log 11 ...
    expect(mockVirtualizer.scrollToIndex).toHaveBeenCalledTimes(1);
    expect(mockVirtualizer.scrollToIndex).toHaveBeenCalledWith(4, { align: 'center' });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  test('restores the expanded state of a message scrolled away and back', () => {
    const wrapper = mountGrid(createTestStore().store);

    act(() => findRow(wrapper, 2).prop('onExpandedChange')(2, true));
    mockRange = [0, 1];
    wrapper.setProps({});
    wrapper.update();
    expect(findRow(wrapper, 2).exists()).toBe(false);

    mockRange = null;
    wrapper.setProps({});
    wrapper.update();

    expect(findRow(wrapper, 2).prop('initialExpanded')).toBe(true);
  });

  test('opens a FAILED step only once while its header is scrolled away and back', () => {
    const { store, actions } = createTestStore({});
    const renderStepHeader = (props) => <NestedStepHeader {...props} />;
    const wrapper = mountGrid(store, {
      data: [step(10, FAILED), log(1)],
      nestedStepHeader: renderStepHeader,
    });
    const requests = () => actions.filter(({ type }) => type === requestNestedStepAction({}).type);

    expect(requests()).toEqual([requestNestedStepAction({ id: 10, autoExpand: true })]);
    // the saga starts the loading of the step
    act(() => {
      store.dispatch({ type: 'fetchNestedStepStartAction', payload: { id: 10, autoExpand: true } });
    });

    mockRange = [1, 1];
    wrapper.setProps({});
    mockRange = null;
    wrapper.setProps({});

    expect(requests()).toHaveLength(1);
  });

  test('measures all rows again when the layout of the rows changes', () => {
    const wrapper = mountGrid(createTestStore().store, { layoutKey: 'small' });
    expect(mockVirtualizer.measure).not.toHaveBeenCalled();

    const mounted = document.createElement('div');
    mockVirtualizer.elementsCache = new Map([['log-1', mounted]]);

    wrapper.setProps({ layoutKey: 'large' });

    expect(mockVirtualizer.measure).toHaveBeenCalledTimes(1);
    // a mounted row is measured again even when its height did not change
    expect(mockVirtualizer.measureElement).toHaveBeenCalledWith(mounted);
  });

  test('keeps the row at the top of the view in place when rows are added above it', () => {
    const { store } = createTestStore();
    const wrapper = mountGrid(store);
    // the view starts 6px into log 11 (row 3: 36 + 56 + 32 px from the top of the rows)
    mockVirtualizer.scrollOffset = 130;
    wrapper.setProps({});

    // a previous page of two logs is added above
    wrapper.setProps({ data: [log(-2), log(-1), ...DATA] });

    expect(mockVirtualizer.scrollOffset).toBe(130 + 2 * 36);
    expect(scrollContainer.current.scrollTop).toBe(130 + 2 * 36);
  });

  test('does not move the view for rows added below the top of the view', () => {
    const wrapper = mountGrid(createTestStore().store);
    mockVirtualizer.scrollOffset = 40;
    wrapper.setProps({});

    wrapper.setProps({ data: [...DATA, log(3), log(4)] });

    expect(mockVirtualizer.scrollOffset).toBe(40);
    expect(scrollContainer.current.scrollTop).toBe(0);
  });

  describe('when the rows move down in the scroll element', () => {
    const OriginalResizeObserver = global.ResizeObserver;
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    let resizeCallbacks;
    let rowsTop;

    beforeEach(() => {
      resizeCallbacks = [];
      rowsTop = 0;
      global.ResizeObserver = class {
        constructor(callback) {
          resizeCallbacks.push(callback);
        }

        observe() {}

        disconnect() {}
      };
      // the top spacer is where the rows start
      Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
        return { top: this.hasAttribute('data-virtual-spacer') ? rowsTop : 0 };
      };
    });

    afterEach(() => {
      global.ResizeObserver = OriginalResizeObserver;
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    test('keeps the row at the top of the view in place', () => {
      const wrapper = mountGrid(createTestStore().store);
      mockVirtualizer.scrollOffset = 130;
      wrapper.setProps({});

      // the "previous page" loader (60px) appears above the rows
      rowsTop = 60;
      act(() => resizeCallbacks.forEach((callback) => callback([])));

      expect(mockVirtualizer.options.scrollMargin).toBe(60);
      expect(mockVirtualizer.scrollOffset).toBe(190);
      expect(scrollContainer.current.scrollTop).toBe(190);
    });

    test('does not move the view while its top is above the rows', () => {
      rowsTop = 300;
      const wrapper = mountGrid(createTestStore().store);
      mockVirtualizer.scrollOffset = 100;
      wrapper.setProps({});

      rowsTop = 360;
      act(() => resizeCallbacks.forEach((callback) => callback([])));

      expect(mockVirtualizer.scrollOffset).toBe(100);
      expect(scrollContainer.current.scrollTop).toBe(0);
    });
  });
});

describe('LogsGridBody in the logs page container', () => {
  const consoleError = console.error;

  beforeAll(() => {
    console.error = (message, ...rest) => {
      if (!/validateDOMNesting|cannot appear as a child of|cannot be a child of/.test(message)) {
        consoleError(message, ...rest);
      }
    };
  });

  afterAll(() => {
    console.error = consoleError;
    mockLogsPageContent = null;
  });

  beforeEach(() => {
    mockRange = null;
    mockVirtualizer.scrollOffset = null;
    mockVirtualizer.options = null;
    mockVirtualizer.scrollToIndex.mockClear();
    mockVirtualizer.elementsCache = new Map();
    Element.prototype.scrollIntoView = jest.fn();
  });

  const gridElement = (store, props = {}) => (
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <div id="root">
          <Grid
            columns={[{ id: 'message', component: Cell }]}
            data={DATA}
            nestedView
            nestedStepHeader={StepHeader}
            eventsInfo={EVENTS_INFO}
            renderBody={(bodyProps) => <LogsGridBody {...bodyProps} />}
            {...props}
          />
        </div>
      </IntlProvider>
    </Provider>
  );

  test('virtualises the rows in the scroll element of the page container', () => {
    jest.useFakeTimers();
    mockLogsPageContent = gridElement(createTestStore().store);
    const wrapper = mount(<LogsPageContainer />);
    // the scroll element is known after the container is mounted: the rows check it again
    act(() => {
      jest.advanceTimersByTime(100);
    });
    jest.useRealTimers();
    wrapper.update();

    expect(mockVirtualizer.options.enabled).toBe(true);
    expect(mockVirtualizer.options.getScrollElement()).toBe(
      wrapper.find(Scrollbars).instance().view,
    );
    expect(spacers(wrapper)).toHaveLength(2);
    expect(rowIds(wrapper)).toEqual([1, 10, 11, 12, 2]);
  });

  test('renders all rows without spacers and scrolls the highlighted row itself without a scroll element', () => {
    const GridWithoutScrollElement = ({ store, ...props }) => gridElement(store, props);
    const grid = mount(<GridWithoutScrollElement store={createTestStore().store} />);

    grid.setProps({ rowHighlightingConfig: { highlightedRowId: 12, isGridRowHighlighted: true } });

    expect(spacers(grid)).toHaveLength(0);
    expect(rowIds(grid)).toEqual([1, 10, 11, 12, 2]);
    expect(mockVirtualizer.options.enabled).toBe(false);
    expect(mockVirtualizer.scrollToIndex).not.toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
