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

import { LOGOUT } from 'controllers/auth/constants';
import { CLEAR_PAGE_STATE } from 'controllers/pages/constants';
import { createRootReducer, createPurifyPageReducer } from './store';

describe('utils/store', () => {
  describe('createRootReducer', () => {
    const initialState = {};
    const previousState = { foo: 'bar' };
    const reducer = (state = initialState) => state;
    const rootReducer = createRootReducer(reducer);

    test('created reducer should return initial state for LOGOUT action', () => {
      expect(rootReducer(previousState, { type: LOGOUT })).toEqual(initialState);
    });

    test('created reducer should return previous state for other actions', () => {
      expect(rootReducer(previousState, { type: 'foo' })).toEqual(previousState);
    });
  });

  describe('createPurifyPageReducer', () => {
    const initialState = {};
    const previousState = { foo: 'bar' };
    const reducer = (state = initialState) => state;

    test('created reducer should return initial state for CLEAR_PAGE_STATE action and oldPage equivalent to targetPage', () => {
      const targetPage = 'userPage';
      const purifyPageReducer = createPurifyPageReducer(reducer, targetPage);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: targetPage },
      };
      expect(purifyPageReducer(previousState, action)).toEqual(initialState);
    });

    test('created reducer should return initial state for CLEAR_PAGE_STATE action and oldPage equivalent to one page from targetPages array', () => {
      const targetPages = ['userPage', 'projectPage'];
      const purifyPageReducer = createPurifyPageReducer(reducer, targetPages);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: 'projectPage' },
      };
      expect(purifyPageReducer(previousState, action)).toEqual(initialState);
    });

    test('created reducer should return previous state for other actions', () => {
      const targetPage = 'userPage';
      const purifyPageReducer = createPurifyPageReducer(reducer, targetPage);

      const action = {
        type: 'foo',
        payload: { oldPage: targetPage },
      };
      expect(purifyPageReducer(previousState, action)).toEqual(previousState);
    });

    test('created reducer should return previous state for action with different oldPage', () => {
      const targetPage = 'userPage';
      const purifyPageReducer = createPurifyPageReducer(reducer, targetPage);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: 'projectPage' },
      };
      expect(purifyPageReducer(previousState, action)).toEqual(previousState);
    });
  });
});
