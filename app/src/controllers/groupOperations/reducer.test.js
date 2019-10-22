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
  SET_LAST_OPERATION,
  RESET_VALIDATION_ERRORS,
  REMOVE_VALIDATION_ERRORS,
  SET_VALIDATION_ERRORS,
  SELECTED_ITEMS_INITIAL_STATE,
  VALIDATION_ERRORS_INITIAL_STATE,
  LAST_OPERATION_INITIAL_STATE,
  SELECT_ITEMS,
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
  UNSELECT_ITEMS,
  TOGGLE_ALL_ITEMS,
} from './constants';
import { lastOperationReducer, validationErrorsReducer, selectedItemsReducer } from './reducer';

const TEST_NAMESPACE = 'test';

describe('groupOperations reducers', () => {
  describe('lastOperationReducer', () => {
    const reducer = lastOperationReducer(TEST_NAMESPACE);

    test('should return initial state', () => {
      expect(reducer(undefined, {})).toBe(LAST_OPERATION_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = {
        operationName: 'foo',
        operationArgs: {},
      };
      expect(reducer(oldState, { type: 'foo' })).toEqual(oldState);
    });

    test('should return old state on unknown namespace', () => {
      const oldState = {
        operationName: 'oldOperation',
        operationArgs: {},
      };
      const newState = reducer(oldState, {
        type: SET_LAST_OPERATION,
        payload: {
          operationName: 'newOperation',
        },
        meta: {
          namespace: 'other',
        },
      });
      expect(newState).toEqual(oldState);
    });

    test('should handle SET_LAST_OPERATION without operationArgs', () => {
      const oldState = {
        operationName: 'oldOperation',
        operationArgs: {
          foo: 'bar',
        },
      };
      const payload = {
        operationName: 'newOperation',
      };
      const newState = reducer(oldState, {
        type: SET_LAST_OPERATION,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual(payload);
    });

    test('should handle SET_LAST_OPERATION with operationArgs', () => {
      const oldState = {
        operationName: 'oldOperation',
        operationArgs: {
          foo: 'bar',
        },
      };
      const payload = {
        operationName: 'newOperation',
        operationArgs: {
          bar: 'foo',
        },
      };
      const newState = reducer(oldState, {
        type: SET_LAST_OPERATION,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual(payload);
    });
  });

  describe('validationErrorsReducer', () => {
    const reducer = validationErrorsReducer(TEST_NAMESPACE);

    test('should return initial state', () => {
      expect(reducer(undefined, {})).toBe(VALIDATION_ERRORS_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = 'oldState';
      expect(reducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should return old state on unknown namespace', () => {
      const oldState = 'oldState';
      const newState = reducer(oldState, {
        type: SET_VALIDATION_ERRORS,
        payload: { foo: 1 },
        meta: {
          namespace: 'other',
        },
      });
      expect(newState).toBe(oldState);
    });

    test('should handle SET_VALIDATION_ERRORS', () => {
      const oldState = { foo: 1 };
      const payload = { bar: 2 };
      const newState = reducer(oldState, {
        type: SET_VALIDATION_ERRORS,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual(payload);
    });

    test('should handle RESET_VALIDATION_ERRORS', () => {
      const oldState = { foo: 1 };
      const newState = reducer(oldState, {
        type: RESET_VALIDATION_ERRORS,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual(VALIDATION_ERRORS_INITIAL_STATE);
    });

    test('should handle REMOVE_VALIDATION_ERRORS', () => {
      const oldState = { foo: 1, bar: 2 };
      const newState = reducer(oldState, {
        type: REMOVE_VALIDATION_ERRORS,
        payload: ['foo'],
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual({ bar: 2 });
    });
  });

  describe('selectedItemsReducer', () => {
    const reducer = selectedItemsReducer(TEST_NAMESPACE);

    test('should return initial state', () => {
      expect(reducer(undefined, {})).toBe(SELECTED_ITEMS_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = [{ id: 1 }];
      expect(reducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should return old state on unknown namespace', () => {
      const oldState = [{ id: 1 }];
      const newState = reducer(oldState, {
        type: SELECT_ITEMS,
        payload: { id: 2 },
        meta: {
          namespace: 'other',
        },
      });
      expect(newState).toBe(oldState);
    });

    test('should handle SELECT_ITEMS', () => {
      const oldState = [{ id: 1 }];
      const payload = [{ id: 2 }, { id: 3 }];
      const newState = reducer(oldState, {
        type: SELECT_ITEMS,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual([...oldState, ...payload]);
    });

    test('should ignore duplicate items on SELECT_ITEMS', () => {
      const oldState = [{ id: 1 }, { id: 2 }];
      const payload = [{ id: 2 }, { id: 3 }];
      const newState = reducer(oldState, {
        type: SELECT_ITEMS,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    test('should handle UNSELECT_ITEMS', () => {
      const oldState = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const payload = [{ id: 2 }, { id: 3 }];
      const newState = reducer(oldState, {
        type: UNSELECT_ITEMS,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual([{ id: 1 }]);
    });

    describe('TOGGLE_ALL_ITEMS', () => {
      test('should add non-selected items in case there are some', () => {
        const oldState = [{ id: 1 }];
        const payload = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const newState = reducer(oldState, {
          type: TOGGLE_ALL_ITEMS,
          payload,
          meta: {
            namespace: TEST_NAMESPACE,
          },
        });
        expect(newState).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });

      test('should unselect items in case there are no new items', () => {
        const oldState = [{ id: 1 }, { id: 2 }];
        const payload = [{ id: 1 }];
        const newState = reducer(oldState, {
          type: TOGGLE_ALL_ITEMS,
          payload,
          meta: {
            namespace: TEST_NAMESPACE,
          },
        });
        expect(newState).toEqual([{ id: 2 }]);
      });
    });

    test('should handle UNSELECT_ALL_ITEMS', () => {
      const oldState = [{ id: 2 }, { id: 3 }];
      const newState = reducer(oldState, {
        type: UNSELECT_ALL_ITEMS,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toEqual([]);
    });

    test('should handle TOGGLE_ITEM_SELECTION', () => {
      const oldState = [{ id: 1 }];
      const stateWithTwoItems = reducer(oldState, {
        type: TOGGLE_ITEM_SELECTION,
        payload: { id: 3 },
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(stateWithTwoItems).toEqual([{ id: 1 }, { id: 3 }]);
      const stateWithOneItem = reducer(stateWithTwoItems, {
        type: TOGGLE_ITEM_SELECTION,
        payload: { id: 1 },
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(stateWithOneItem).toEqual([{ id: 3 }]);
    });
  });
});
