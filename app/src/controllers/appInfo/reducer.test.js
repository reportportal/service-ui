import { appInfoReducer } from './reducer';
import { FETCH_INFO_SUCCESS } from './constants';

describe('appInfo reducer', () => {
  test('should return initial state', () => {
    expect(appInfoReducer(undefined, {})).toEqual({});
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(appInfoReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle FETCH_INFO_SUCCESS', () => {
    const payload = {
      foo: 123,
    };
    const newState = appInfoReducer(undefined, {
      type: FETCH_INFO_SUCCESS,
      payload,
    });
    expect(newState).toEqual(payload);
  });
});
