import { authReducer } from './reducer';
import { AUTH_SUCCESS, LOGOUT, INITIAL_STATE } from './constants';

describe('auth reducer', () => {
  test('should return the initial state', () => {
    expect(authReducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(authReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle AUTH_SUCCESS', () => {
    const newState = authReducer(undefined, {
      type: AUTH_SUCCESS,
    });
    expect(newState).toEqual({
      authorized: true,
    });
  });

  test('should handle LOGOUT', () => {
    const newState = authReducer(undefined, {
      type: LOGOUT,
    });
    expect(newState).toEqual({
      authorized: false,
    });
  });
});
