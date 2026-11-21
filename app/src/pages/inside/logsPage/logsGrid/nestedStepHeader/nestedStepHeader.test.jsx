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
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { FAILED, PASSED } from 'common/constants/testStatuses';
import { nestedStepsReducer, requestNestedStepAction } from 'controllers/log/nestedSteps';
import { NestedStepHeader } from './nestedStepHeader';

jest.mock('pages/inside/common/durationBlock', () => ({ DurationBlock: () => null }));
jest.mock('pages/inside/common/testItemStatus', () => ({ TestItemStatus: () => null }));
jest.mock('components/main/markdown', () => ({ MarkdownViewer: () => null }));

const REQUEST = requestNestedStepAction({}).type;

// the saga is not part of this test: the request marks the step as loaded and opened, as it does
const createTestStore = (nestedSteps = {}) => {
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
  return { store, requests: () => actions.filter(({ type }) => type === REQUEST) };
};

const mountHeader = (store, props = {}) =>
  mount(
    <Provider store={store}>
      <NestedStepHeader data={{ id: 3, status: FAILED, hasContent: true }} collapsed {...props} />
    </Provider>,
  );

describe('NestedStepHeader', () => {
  test('opens a collapsed FAILED step on mount', () => {
    const { store, requests } = createTestStore();

    mountHeader(store);

    expect(requests()).toEqual([requestNestedStepAction({ id: 3, autoExpand: true })]);
  });

  test('opens a FAILED step only once when the header is mounted again', () => {
    const { store, requests } = createTestStore();

    mountHeader(store).unmount();
    // the request starts the loading of the step, which records that the step was handled
    store.dispatch({ type: 'fetchNestedStepStartAction', payload: { id: 3, autoExpand: true } });
    mountHeader(store);

    expect(requests()).toHaveLength(1);
  });

  test('does not open the step again after it was toggled by the user', () => {
    const { store, requests } = createTestStore({ 3: { collapsed: true, autoExpandDone: true } });

    mountHeader(store);

    expect(requests()).toHaveLength(0);
  });

  test('does not open an already expanded FAILED step', () => {
    const { store, requests } = createTestStore();

    mountHeader(store, { collapsed: false });

    expect(requests()).toHaveLength(0);
  });

  test('does not open steps that are not FAILED', () => {
    const { store, requests } = createTestStore();

    mountHeader(store, { data: { id: 3, status: PASSED, hasContent: true } });

    expect(requests()).toHaveLength(0);
  });
});
