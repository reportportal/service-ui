import { localSortingReducer } from './reducer';
import { UPDATE_LOCAL_SORTING, DEFAULT_LOCAL_SORTING } from './constants';

describe('localSortingReducer', () => {
  test('should return initial state', () => {
    expect(localSortingReducer(undefined, {})).toBe(DEFAULT_LOCAL_SORTING);
  });

  test('should return old state on unknown action', () => {
    const oldState = {};
    expect(localSortingReducer(oldState, { type: 'TEST' })).toBe(oldState);
  });

  test('should handle UPDATE_LOCAL_SORTING', () => {
    expect(
      localSortingReducer(undefined, { type: UPDATE_LOCAL_SORTING, payload: { size: 1 } }),
    ).toEqual({ size: 1 });
  });
});
