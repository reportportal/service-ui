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

import { SHOW_MODAL, HIDE_MODAL, INITIAL_STATE } from './constants';
import { modalReducer } from './reducer';

describe('modal reducer', () => {
  test('should return initial state', () => {
    expect(modalReducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(modalReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle SHOW_MODAL', () => {
    const payload = {
      activeModal: { id: 'test', data: { foo: 'bar' } },
    };
    const newState = modalReducer(undefined, {
      type: SHOW_MODAL,
      payload,
    });
    expect(newState).toEqual(payload);
  });

  test('should handle HIDE_MODAL', () => {
    const oldState = {
      activeModal: { id: 'test', data: { foo: 'bar' } },
    };
    const newState = modalReducer(oldState, {
      type: HIDE_MODAL,
    });
    expect(newState).toEqual({
      activeModal: null,
    });
  });
});
