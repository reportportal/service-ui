/*
 * Copyright 2019 EPAM Systems
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

import { FETCH_SUCCESS, INITIAL_STATE } from './constants';
import { fetchReducer } from './reducer';

describe('fetch', () => {
  test('should return initial state', () => {
    const reducer = fetchReducer('test');
    expect(reducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const reducer = fetchReducer('test');
    const oldState = { foo: 1 };
    expect(reducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should support setting initial state', () => {
    const initialState = {};
    const reducer = fetchReducer('test', { initialState });
    expect(reducer(undefined, {})).toBe(initialState);
  });

  test('should return old state on unknown namespace', () => {
    const reducer = fetchReducer('test');
    const oldState = { foo: 1 };
    expect(
      reducer(oldState, {
        type: FETCH_SUCCESS,
        payload: { foo: 2 },
        meta: { namespace: 'foo' },
      }),
    ).toBe(oldState);
  });

  test('should handle FETCH_SUCCESS', () => {
    const initialState = {};
    const reducer = fetchReducer('test', { initialState });
    expect(
      reducer(initialState, {
        type: FETCH_SUCCESS,
        payload: { foo: 1 },
        meta: { namespace: 'test' },
      }),
    ).toEqual({
      foo: 1,
    });
  });

  test('should support contentPath', () => {
    const initialState = {};
    const reducer = fetchReducer('test', { initialState, contentPath: 'bar' });
    expect(
      reducer(initialState, {
        type: FETCH_SUCCESS,
        payload: { foo: 1, bar: { baz: 1 } },
        meta: { namespace: 'test' },
      }),
    ).toEqual({
      baz: 1,
    });
  });
});
