import { langReducer } from './reducer';
import { INITIAL_STATE } from './constants';

describe('lang reducer', () => {
  test('should return initial state', () => {
    expect(langReducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(langReducer(oldState, { type: 'foo' })).toBe(oldState);
  });
});
