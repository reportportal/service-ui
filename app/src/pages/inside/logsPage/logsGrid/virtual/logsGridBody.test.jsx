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
import { Grid } from 'components/main/grid';
import { GridRow } from 'components/main/grid/gridBody/gridRow';
import { NEXT, PREVIOUS } from 'controllers/log';
import {
  nestedStepsReducer,
  requestNestedStepAction,
  loadMoreNestedStepAction,
  fetchCurrentStepAction,
} from 'controllers/log/nestedSteps';
import { LogsGridBody } from './logsGridBody';

const mockTrackEvent = jest.fn();
jest.mock('react-tracking', () => {
  const tracking = {
    trackEvent: (...args) => mockTrackEvent(...args),
    getTrackingData: () => ({}),
  };
  return {
    __esModule: true,
    default: () => (Component) => (props) => <Component tracking={tracking} {...props} />,
    useTracking: () => tracking,
  };
});

const log = (id) => ({ id, message: `log ${id}` });
const step = (id) => ({ id, name: `step ${id}`, hasContent: true });
const page = (first, last, total) => ({
  number: last,
  firstNumber: first,
  totalPages: total,
  size: 300,
  totalElements: total * 300,
  loaded: (last - first + 1) * 300,
});
const loadedStep = (content, pageData = page(1, 1, 1), extra = {}) => ({
  collapsed: false,
  loading: false,
  initial: false,
  content,
  page: pageData,
  ...extra,
});

const DATA = [log(1), step(10), log(2), step(40)];
const NESTED_STEPS = {
  10: loadedStep([log(11), step(20), step(30), log(12)], page(2, 2, 3)),
  20: loadedStep([log(21)]),
  30: loadedStep([log(31)], page(1, 1, 1), { collapsed: true }),
};
const EVENTS_INFO = {
  getClickOnLoadMore: (direction) => ({ loadMore: direction }),
  clickOnLoadCurrentStep: { loadCurrentStep: true },
};

const StepHeader = ({ data, level, collapsed, loading, onToggle, additionalNameCellBlock }) => (
  <div
    className="step-header"
    data-step={data.id}
    data-description={`${level}:${collapsed}:${loading}`}
    onClick={onToggle}
  >
    {additionalNameCellBlock}
  </div>
);

StepHeader.propTypes = {
  data: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
  collapsed: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  additionalNameCellBlock: PropTypes.node,
};
StepHeader.defaultProps = {
  additionalNameCellBlock: null,
};

const Cell = ({ value }) => <span>{value.message}</span>;
Cell.propTypes = {
  value: PropTypes.object.isRequired,
};
const COLUMNS = [{ id: 'message', component: Cell }];

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

const renderFlatBody = (bodyProps) => <LogsGridBody {...bodyProps} />;

const mountGrid = (store, props = {}) =>
  mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <div id="root">
          <Grid
            columns={COLUMNS}
            data={DATA}
            nestedView
            nestedStepHeader={StepHeader}
            eventsInfo={EVENTS_INFO}
            {...props}
          />
        </div>
      </IntlProvider>
    </Provider>,
  );

const getText = (element) => element.textContent.replace(/\*\*FILE_MOCK\*\*/g, '');
const getLevel = (element) => +(/level-(\d+)/.exec(element.className)?.[1] || 0);

// the rows of the grid in document order, described by what the user sees in each of them
const describeRows = (wrapper) =>
  Array.from(
    wrapper
      .find('#root')
      .getDOMNode()
      .querySelectorAll('.grid-row-wrapper, .step-header, .row-more'),
  ).map((element) => {
    if (element.classList.contains('grid-row-wrapper')) {
      return `log ${element.dataset.id} level ${getLevel(element.querySelector('.grid-row'))}`;
    }
    if (element.classList.contains('step-header')) {
      return `step ${element.dataset.step} ${element.dataset.description} [${getText(element)}]`;
    }
    return `more level ${getLevel(element)} [${getText(element)}]`;
  });

describe('LogsGridBody', () => {
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
    mockTrackEvent.mockClear();
  });

  test('renders the same rows in the same order as the recursive nested grid', () => {
    const recursive = describeRows(mountGrid(createTestStore().store));
    const flat = describeRows(mountGrid(createTestStore().store, { renderBody: renderFlatBody }));

    expect(flat).toEqual(recursive);
    expect(flat).toEqual([
      'log 1 level 0',
      'step 10 0:false:false []',
      'more level 1 [Load previous 300Load current step]',
      'log 11 level 1',
      'step 20 1:false:false []',
      'log 21 level 2',
      'step 30 1:true:false []',
      'log 12 level 1',
      'more level 1 [Load next 300Load current step]',
      'log 2 level 0',
      'step 40 0:true:false [Load current step]',
    ]);
  });

  test('renders the same rows as the recursive nested grid while a step is loading', () => {
    const nestedSteps = { ...NESTED_STEPS, 10: { ...NESTED_STEPS[10], loading: true } };
    const recursive = describeRows(mountGrid(createTestStore(nestedSteps).store));
    const flat = describeRows(
      mountGrid(createTestStore(nestedSteps).store, { renderBody: renderFlatBody }),
    );

    expect(flat).toEqual(recursive);
  });

  test('requests a step when its header is clicked', () => {
    const { store, actions } = createTestStore();
    const wrapper = mountGrid(store, { renderBody: renderFlatBody });

    wrapper.find('[data-step=40]').simulate('click');

    expect(actions).toContainEqual(requestNestedStepAction({ id: 40 }));
  });

  test('loads the next page of a step and tracks it', () => {
    const { store, actions } = createTestStore();
    const wrapper = mountGrid(store, { renderBody: renderFlatBody });

    wrapper.find('.row-more').last().find('.load-button').first().simulate('click');

    expect(actions).toContainEqual(loadMoreNestedStepAction({ id: 10, loadDirection: NEXT }));
    expect(mockTrackEvent).toHaveBeenCalledWith({ loadMore: NEXT });
  });

  test('loads the current step from the header and tracks it', () => {
    const { store, actions } = createTestStore();
    const wrapper = mountGrid(store, { renderBody: renderFlatBody });

    wrapper.find('[data-step=40]').find('.load-button').simulate('click');

    expect(actions).toContainEqual(fetchCurrentStepAction({ id: 40 }));
    expect(mockTrackEvent).toHaveBeenCalledWith(EVENTS_INFO.clickOnLoadCurrentStep);
  });

  test('brings the first log of the step back into view after "load previous"', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const { store, actions } = createTestStore();
    const wrapper = mountGrid(store, { renderBody: renderFlatBody });

    wrapper.find('.row-more').first().find('.load-button').first().simulate('click');
    expect(actions).toContainEqual(loadMoreNestedStepAction({ id: 10, loadDirection: PREVIOUS }));
    expect(mockTrackEvent).toHaveBeenCalledWith({ loadMore: PREVIOUS });

    act(() => {
      store.dispatch({ type: 'fetchNestedStepStartAction', payload: { id: 10 } });
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
    act(() => {
      store.dispatch({
        type: 'fetchNestedStepSuccessAction',
        payload: {
          id: 10,
          content: [log(5), ...NESTED_STEPS[10].content],
          page: page(1, 2, 3),
        },
      });
    });
    wrapper.update();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
    expect(scrollIntoView.mock.contexts[0].closest('.grid-row-wrapper').dataset.id).toBe('11');
  });

  test('restores the expanded state of a long message when its row is mounted again', () => {
    const { store } = createTestStore();
    const wrapper = mountGrid(store, { renderBody: renderFlatBody });
    const findRow = (id) => wrapper.find(GridRow).filterWhere((row) => row.prop('value').id === id);

    act(() => findRow(21).prop('onExpandedChange')(21, true));
    // the parent step is collapsed and expanded again: the row is unmounted and mounted again
    act(() => {
      store.dispatch({ type: 'toggleNestedStep', payload: { id: 20 } });
    });
    act(() => {
      store.dispatch({ type: 'toggleNestedStep', payload: { id: 20 } });
    });
    wrapper.update();

    expect(findRow(21).prop('initialExpanded')).toBe(true);
    expect(findRow(11).prop('initialExpanded')).toBeUndefined();
  });

  test('forgets the expanded state of messages when the collapsing setting changes', () => {
    const { store } = createTestStore();
    const wrapper = mountGrid(store, { renderBody: renderFlatBody, expanded: false });
    const findRow = (id) => wrapper.find(GridRow).filterWhere((row) => row.prop('value').id === id);

    act(() => findRow(1).prop('onExpandedChange')(1, true));
    wrapper.setProps({
      children: (
        <IntlProvider locale="en" onError={() => {}}>
          <div id="root">
            <Grid
              columns={COLUMNS}
              data={DATA}
              nestedView
              nestedStepHeader={StepHeader}
              eventsInfo={EVENTS_INFO}
              renderBody={renderFlatBody}
              expanded
            />
          </div>
        </IntlProvider>
      ),
    });
    wrapper.update();

    expect(findRow(1).prop('initialExpanded')).not.toBe(true);
  });
});
