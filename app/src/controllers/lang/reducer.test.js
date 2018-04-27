import { langReducer } from './reducer';
import { CHANGE_LANG_ACTION, INITIAL_STATE } from './constants';

describe('lang reducer', () => {
  test('should return initial state', () => {
    expect(langReducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(langReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle CHANGE_LANG_ACTION', () => {
    const payload = 'ru';
    const newState = langReducer(undefined, {
      type: CHANGE_LANG_ACTION,
      payload,
    });
    expect(newState).toEqual(payload);
  });
});
