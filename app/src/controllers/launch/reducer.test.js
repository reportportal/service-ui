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

import { localSortingReducer } from './reducer';
import { UPDATE_LOCAL_SORTING, DEFAULT_LOCAL_SORTING } from './constants';

describe('localSortingReducer', () => {
  test('should return initial state', () => {
    expect(localSortingReducer(undefined, {})).toBe(DEFAULT_LOCAL_SORTING);
  });

  test('should return old state on unknown action', () => {
    const oldState = {};
    expect(localSortingReducer(oldState, { type: 'TEST' })).toBe(oldState);
  });

  test('should handle UPDATE_LOCAL_SORTING', () => {
    expect(
      localSortingReducer(undefined, { type: UPDATE_LOCAL_SORTING, payload: { size: 1 } }),
    ).toEqual({ size: 1 });
  });
});
