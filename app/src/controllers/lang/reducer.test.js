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

import { langReducer } from './reducer';
import { CHANGE_LANG_ACTION, INITIAL_STATE } from './constants';

describe('lang reducer', () => {
  test('should return initial state', () => {
    expect(langReducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(langReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle CHANGE_LANG_ACTION', () => {
    const payload = 'ru';
    const newState = langReducer(undefined, {
      type: CHANGE_LANG_ACTION,
      payload,
    });
    expect(newState).toEqual(payload);
  });
});
