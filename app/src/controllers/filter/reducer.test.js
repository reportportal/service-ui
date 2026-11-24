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

import {
  FETCH_USER_FILTERS_SUCCESS,
  UPDATE_FILTER_CONDITIONS,
  SET_PAGE_LOADING,
} from './constants';
import { updateFilterSuccessAction } from './actionCreators';
import { launchesFiltersReducer, launchesFiltersReadyReducer, pageLoadingReducer } from './reducer';

describe('filter reducer', () => {
  describe('launchesFiltersReducer', () => {
    test('should return old state on unknown action', () => {
      const oldState = [{ id: 0 }];
      expect(
        launchesFiltersReducer(oldState, {
          type: 'test',
        }),
      ).toBe(oldState);
    });

    test('should update entities in filter on UPDATE_FILTER_CONDITIONS', () => {
      const oldState = [
        {
          id: '0',
          conditions: [
            {
              value: 'foo',
            },
          ],
        },
        {
          id: '1',
          conditions: [
            {
              value: 'bar',
            },
          ],
        },
      ];
      const newState = launchesFiltersReducer(oldState, {
        type: UPDATE_FILTER_CONDITIONS,
        payload: {
          filterId: '1',
          conditions: [
            {
              value: 'baz',
            },
          ],
        },
      });
      expect(newState).toEqual([
        {
          id: '0',
          conditions: [
            {
              value: 'foo',
            },
          ],
        },
        {
          id: '1',
          conditions: [
            {
              value: 'baz',
            },
          ],
        },
      ]);
    });

    test('replaces the filter with the saved one on UPDATE_FILTER_SUCCESS', () => {
      const saved = { id: 1, conditions: [{ value: 'a' }] };
      expect(
        launchesFiltersReducer([{ id: 1, conditions: [] }], updateFilterSuccessAction(saved)),
      ).toEqual([saved]);
    });

    test('keeps the edited conditions and orders on UPDATE_FILTER_SUCCESS with keepDraft', () => {
      const orders = [{ sortingColumn: 'name', isAsc: true }];
      const oldState = [{ id: 1, name: 'f', conditions: [{ value: 'b' }], orders }];
      expect(
        launchesFiltersReducer(
          oldState,
          updateFilterSuccessAction(
            { id: 1, name: 'f', conditions: [{ value: 'a' }], orders: [] },
            undefined,
            true,
          ),
        ),
      ).toEqual([{ id: 1, name: 'f', conditions: [{ value: 'b' }], orders }]);
    });

    test('takes the new name of a renamed filter but keeps the edited conditions with keepDraft', () => {
      const oldState = [{ id: 1, name: 'old', conditions: [{ value: 'b' }], orders: [] }];
      expect(
        launchesFiltersReducer(
          oldState,
          updateFilterSuccessAction(
            { id: 1, name: 'new', description: 'd', conditions: [{ value: 'a' }], orders: [] },
            undefined,
            true,
          ),
        ),
      ).toEqual([
        { id: 1, name: 'new', description: 'd', conditions: [{ value: 'b' }], orders: [] },
      ]);
    });

    test('ignores UPDATE_FILTER_SUCCESS with keepDraft when the filter was closed', () => {
      const oldState = [{ id: 2, conditions: [] }];
      expect(
        launchesFiltersReducer(
          oldState,
          updateFilterSuccessAction({ id: 1, conditions: [] }, undefined, true),
        ),
      ).toBe(oldState);
    });
  });

  describe('launchesFiltersReadyReducer', () => {
    test('should return old state on unknown action', () => {
      const oldState = true;
      expect(
        launchesFiltersReadyReducer(oldState, {
          type: 'unknownAction',
        }),
      ).toBe(oldState);
    });

    test('should return true on FETCH_USER_FILTERS_SUCCESS action', () => {
      expect(launchesFiltersReadyReducer(false, { type: FETCH_USER_FILTERS_SUCCESS })).toBe(true);
    });
  });

  describe('pageLoadingReducer', () => {
    test('should return initial state', () => {
      expect(pageLoadingReducer(undefined, {})).toBe(false);
    });

    test('should return old state on unknown action', () => {
      const oldState = false;
      expect(pageLoadingReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle SET_PAGE_LOADING', () => {
      const payload = true;
      const newState = pageLoadingReducer(SET_PAGE_LOADING, {
        type: SET_PAGE_LOADING,
        payload,
      });
      expect(newState).toEqual(payload);
    });
  });
});
