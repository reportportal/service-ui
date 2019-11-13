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

import { authorizedReducer, tokenReducer } from './reducer';
import { AUTH_SUCCESS, LOGOUT, SET_TOKEN, DEFAULT_TOKEN } from './constants';

describe('authReducer', () => {
  describe('authorizedReducer reducer', () => {
    test('should return the initial state', () => {
      expect(authorizedReducer(undefined, {})).toBe(false);
    });

    test('should return old state on unknown action', () => {
      const oldState = false;
      expect(authorizedReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle AUTH_SUCCESS', () => {
      const newState = authorizedReducer(undefined, {
        type: AUTH_SUCCESS,
      });
      expect(newState).toBe(true);
    });

    test('should handle LOGOUT', () => {
      const newState = authorizedReducer(undefined, {
        type: LOGOUT,
      });
      expect(newState).toBe(false);
    });
  });

  describe('tokenReducer', () => {
    test('should return the initial state', () => {
      expect(tokenReducer(undefined, {})).toBe(DEFAULT_TOKEN);
    });

    test('should return old state on unknown action', () => {
      const oldState = DEFAULT_TOKEN;
      expect(tokenReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle SET_TOKEN', () => {
      expect(tokenReducer(DEFAULT_TOKEN, { type: SET_TOKEN, payload: 'token' })).toBe('token');
    });
  });
});
