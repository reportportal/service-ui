import { authorizedReducer } from './reducer';
import { AUTH_SUCCESS, LOGOUT } from './constants';

describe('auth reducer', () => {
  test('should return the initial state', () => {
    expect(authorizedReducer(undefined, {})).toEqual(false);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(authorizedReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle AUTH_SUCCESS', () => {
    const newState = authorizedReducer(undefined, {
      type: AUTH_SUCCESS,
    });
    expect(newState).toEqual(true);
  });

  test('should handle LOGOUT', () => {
    const newState = authorizedReducer(undefined, {
      type: LOGOUT,
    });
    expect(newState).toEqual(false);
  });
});
