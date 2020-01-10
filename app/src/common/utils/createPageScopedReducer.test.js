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

import { CLEAR_PAGE_STATE } from 'controllers/pages';
import { createPageScopedReducer } from './createPageScopedReducer';

describe('utils/store', () => {
  describe('createPageScopedReducer', () => {
    const initialState = {};
    const previousState = { foo: 'bar' };
    const reducer = (state = initialState) => state;

    test('created reducer should return initial state for CLEAR_PAGE_STATE action and oldPage equivalent to targetPage and other newPage', () => {
      const targetPage = 'userPage';
      const pageScopedReducer = createPageScopedReducer(reducer, targetPage);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: targetPage, newPage: 'newPage' },
      };
      expect(pageScopedReducer(previousState, action)).toEqual(initialState);
    });

    test('created reducer should return initial state for CLEAR_PAGE_STATE action and oldPage equivalent to one page from targetPages array and other newPage', () => {
      const targetPages = ['userPage', 'projectPage'];
      const pageScopedReducer = createPageScopedReducer(reducer, targetPages);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: 'projectPage', newPage: 'newPage' },
      };
      expect(pageScopedReducer(previousState, action)).toEqual(initialState);
    });

    test('created reducer should return previous state for CLEAR_PAGE_STATE action and newPage equivalent to one page from targetPages array', () => {
      const targetPages = ['userPage', 'projectPage'];
      const pageScopedReducer = createPageScopedReducer(reducer, targetPages);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: 'projectPage', newPage: 'userPage' },
      };
      expect(pageScopedReducer(previousState, action)).toEqual(previousState);
    });

    test('created reducer should return previous state for other actions', () => {
      const targetPage = 'userPage';
      const pageScopedReducer = createPageScopedReducer(reducer, targetPage);

      const action = {
        type: 'foo',
        payload: { oldPage: targetPage, newPage: 'newPage' },
      };
      expect(pageScopedReducer(previousState, action)).toEqual(previousState);
    });

    test('created reducer should return previous state for action with different oldPage', () => {
      const targetPage = 'userPage';
      const pageScopedReducer = createPageScopedReducer(reducer, targetPage);

      const action = {
        type: CLEAR_PAGE_STATE,
        payload: { oldPage: 'projectPage', newPage: 'newPage' },
      };
      expect(pageScopedReducer(previousState, action)).toEqual(previousState);
    });
  });
});
