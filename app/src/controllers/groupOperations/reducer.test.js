import {
  SET_LAST_OPERATION_NAME,
  RESET_VALIDATION_ERRORS,
  REMOVE_VALIDATION_ERROR,
  SET_VALIDATION_ERRORS,
  SELECTED_ITEMS_INITIAL_STATE,
  VALIDATION_ERRORS_INITIAL_STATE,
  LAST_OPERATION_INITIAL_STATE,
  SELECT_ITEMS,
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
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
      const oldState = 'oldState';
      expect(reducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should return old state on unknown namespace', () => {
      const oldState = 'oldState';
      const newState = reducer(oldState, {
        type: SET_LAST_OPERATION_NAME,
        payload: 'foo',
        meta: {
          namespace: 'other',
        },
      });
      expect(newState).toBe(oldState);
    });

    test('should handle SET_LAST_OPERATION_NAME', () => {
      const oldState = 'oldOperation';
      const payload = 'newOperation';
      const newState = reducer(oldState, {
        type: SET_LAST_OPERATION_NAME,
        payload,
        meta: {
          namespace: TEST_NAMESPACE,
        },
      });
      expect(newState).toBe(payload);
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

    test('should handle REMOVE_VALIDATION_ERROR', () => {
      const oldState = { foo: 1, bar: 2 };
      const newState = reducer(oldState, {
        type: REMOVE_VALIDATION_ERROR,
        payload: 'foo',
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
      expect(newState).toEqual(payload);
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

    test('shoudl handle TOGGLE_ITEM_SELECTION', () => {
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
