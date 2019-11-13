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

import { FETCH_USER_FILTERS_SUCCESS, UPDATE_FILTER_CONDITIONS } from './constants';
import { launchesFiltersReducer, launchesFiltersReadyReducer } from './reducer';

describe('filter reducer', () => {
  describe('launchesFiltersReducer', () => {
    test('should return old state in unknown action', () => {
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
  });

  describe('launchesFiltersReadyReducer', () => {
    test('should return old state in unknown action', () => {
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
});
