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

import { FETCH_ERROR, FETCH_SUCCESS } from 'controllers/fetch';
import { UPDATE_FILTER_SUCCESS, LAUNCHES_FILTERS_UPDATE_NAMESPACE } from './constants';
import { updateLaunchesFilter } from './sagas';

const filter = { id: 5, name: 'f', conditions: [{ value: 'a' }] };
const meta = { namespace: LAUNCHES_FILTERS_UPDATE_NAMESPACE };

const runUntilTake = () => {
  const gen = updateLaunchesFilter({ payload: filter });
  gen.next(); // select projectKey
  const putFetch = gen.next('project').value;
  expect(putFetch.PUT.action.payload.options.method).toBe('put');
  const takeEffect = gen.next().value;
  expect(takeEffect.TAKE).toBeDefined();
  return gen;
};

describe('controllers/filter/sagas updateLaunchesFilter', () => {
  test('does not report success when the PUT fails', () => {
    const gen = runUntilTake();
    const step = gen.next({ type: FETCH_ERROR, meta });
    expect(step.done).toBe(true);
  });

  test('reports success after the PUT succeeds', () => {
    const gen = runUntilTake();
    const successPut = gen.next({ type: FETCH_SUCCESS, meta }).value;
    expect(successPut.PUT.action.type).toBe(UPDATE_FILTER_SUCCESS);
    const notification = gen.next().value;
    expect(notification.PUT.action.payload.messageId).toBe('updateFilterSuccess');
    expect(gen.next().done).toBe(true);
  });
});
