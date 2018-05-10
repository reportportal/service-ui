import {
  FETCH_USER_SUCCESS,
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SETTINGS_INITIAL_STATE,
  START_TIME_FORMAT_ABSOLUTE,
} from './constants';
import { settingsReducer, userInfoReducer, activeProjectReducer } from './reducer';

describe('user reducer', () => {
  describe('settingsReducer', () => {
    test('should return initial state', () => {
      expect(settingsReducer(undefined, {})).toBe(SETTINGS_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = { foo: 1 };
      expect(settingsReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle SET_START_TIME_FORMAT', () => {
      const payload = START_TIME_FORMAT_ABSOLUTE;
      const newState = settingsReducer(SETTINGS_INITIAL_STATE, {
        type: SET_START_TIME_FORMAT,
        payload,
      });
      expect(newState).toEqual({
        startTimeFormat: payload,
      });
    });
  });

  describe('userInfoReducer', () => {
    test('should return initial state', () => {
      expect(userInfoReducer(undefined, {})).toEqual({});
    });

    test('should return old state on unknown action', () => {
      const oldState = { foo: 1 };
      expect(userInfoReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle FETCH_USER_SUCCESS', () => {
      const payload = { id: 0 };
      const newState = userInfoReducer(undefined, {
        type: FETCH_USER_SUCCESS,
        payload,
      });
      expect(newState).toEqual(payload);
    });
  });

  describe('activeProjectReducer', () => {
    test('should return initial state', () => {
      expect(activeProjectReducer(undefined, {})).toEqual('');
    });

    test('should return old state on unknown action', () => {
      const oldState = { foo: 1 };
      expect(activeProjectReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle SET_ACTIVE_PROJECT', () => {
      const payload = 'testProject';
      const newState = activeProjectReducer(undefined, {
        type: SET_ACTIVE_PROJECT,
        payload,
      });
      expect(newState).toEqual(payload);
    });
  });
});
