import { SHOW_MODAL, HIDE_MODAL, INITIAL_STATE } from './constants';
import { modalReducer } from './reducer';

describe('modal reducer', () => {
  test('should return initial state', () => {
    expect(modalReducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(modalReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle SHOW_MODAL', () => {
    const payload = {
      activeModal: { id: 'test', data: { foo: 'bar' } },
    };
    const newState = modalReducer(undefined, {
      type: SHOW_MODAL,
      payload,
    });
    expect(newState).toEqual(payload);
  });

  test('should handle HIDE_MODAL', () => {
    const oldState = {
      activeModal: { id: 'test', data: { foo: 'bar' } },
    };
    const newState = modalReducer(oldState, {
      type: HIDE_MODAL,
    });
    expect(newState).toEqual({
      activeModal: null,
    });
  });
});
