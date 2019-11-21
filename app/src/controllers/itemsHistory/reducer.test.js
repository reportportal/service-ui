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

import { RESET_HISTORY, SET_HISTORY_PAGE_LOADING, PAGINATION_INITIAL_STATE } from './constants';
import { historyReducer, historyPaginationReducer, loadingReducer } from './reducer';

describe('items history reducer', () => {
  describe('historyReducer', () => {
    test('should return old state on unknown action', () => {
      const oldState = [{ id: 0 }];
      expect(
        historyReducer(oldState, {
          type: 'unknownAction',
        }),
      ).toBe(oldState);
    });

    test('should return empty array on RESET_HISTORY', () => {
      const oldState = [{ id: 0 }];
      const newState = historyReducer(oldState, {
        type: RESET_HISTORY,
      });
      expect(newState).toEqual([]);
    });
  });

  describe('historyPaginationReducer', () => {
    test('should return old state on unknown action', () => {
      const oldState = {
        number: 1,
        size: 30,
        totalElements: 0,
        totalPages: 0,
      };
      expect(
        historyPaginationReducer(oldState, {
          type: 'unknownAction',
        }),
      ).toBe(oldState);
    });

    test('should return PAGINATION_INITIAL_STATE on RESET_HISTORY', () => {
      const oldState = {
        number: 2,
        size: 30,
        totalElements: 180,
        totalPages: 6,
      };
      const newState = historyPaginationReducer(oldState, {
        type: RESET_HISTORY,
      });
      expect(newState).toEqual(PAGINATION_INITIAL_STATE);
    });
  });

  describe('loadingReducer', () => {
    test('should return old state on unknown action', () => {
      const oldState = true;
      expect(
        loadingReducer(oldState, {
          type: 'unknownAction',
        }),
      ).toBe(oldState);
    });

    test('should return action payload on SET_HISTORY_PAGE_LOADING action', () => {
      expect(loadingReducer(false, { type: SET_HISTORY_PAGE_LOADING, payload: true })).toBe(true);
    });
  });
});
