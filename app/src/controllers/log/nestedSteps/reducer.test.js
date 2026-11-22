/*
 * Copyright 2026 EPAM Systems
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

import { nestedStepsReducer } from './reducer';
import {
  fetchNestedStepStartAction,
  fetchNestedStepErrorAction,
  fetchNestedStepSuccessAction,
  toggleNestedStepAction,
} from './actionCreators';

describe('nestedStepsReducer', () => {
  test('stops loading and marks the step as not requested when the first request fails', () => {
    const loading = nestedStepsReducer({}, fetchNestedStepStartAction({ id: 7 }));
    const state = nestedStepsReducer(loading, fetchNestedStepErrorAction({ message: 'x' }, 7));

    expect(state[7].loading).toBe(false);
    expect(state[7].initial).toBe(true);
  });

  test('keeps the loaded content when a "load more" request fails', () => {
    const loaded = nestedStepsReducer(
      {},
      fetchNestedStepSuccessAction({ id: 7, content: [{ id: 1 }], page: { number: 1 } }),
    );
    const loading = nestedStepsReducer(loaded, fetchNestedStepStartAction({ id: 7 }));
    const state = nestedStepsReducer(loading, fetchNestedStepErrorAction({ message: 'x' }, 7));

    expect(state[7].loading).toBe(false);
    expect(state[7].initial).toBe(false);
    expect(state[7].content).toEqual([{ id: 1 }]);
  });

  test('ignores errors of unknown steps', () => {
    const state = {};
    expect(nestedStepsReducer(state, fetchNestedStepErrorAction({}, 1))).toBe(state);
  });

  describe('auto-expand guard', () => {
    test('is not set by a regular request', () => {
      const state = nestedStepsReducer({}, fetchNestedStepStartAction({ id: 7 }));

      expect(state[7].autoExpandDone).toBeUndefined();
    });

    test('is set by an automatic request and survives the whole request life cycle', () => {
      let state = nestedStepsReducer({}, fetchNestedStepStartAction({ id: 7, autoExpand: true }));
      state = nestedStepsReducer(state, fetchNestedStepErrorAction({ message: 'x' }, 7));
      expect(state[7].autoExpandDone).toBe(true);

      state = nestedStepsReducer(
        state,
        fetchNestedStepSuccessAction({ id: 7, content: [], page: {} }),
      );
      expect(state[7].autoExpandDone).toBe(true);
    });

    test('is set by toggling the step', () => {
      const loaded = nestedStepsReducer(
        {},
        fetchNestedStepSuccessAction({ id: 7, content: [], page: {} }),
      );
      const state = nestedStepsReducer(
        { 7: { ...loaded[7], collapsed: true } },
        toggleNestedStepAction({ id: 7 }),
      );

      expect(state[7].collapsed).toBe(false);
      expect(state[7].autoExpandDone).toBe(true);
    });
  });
});
