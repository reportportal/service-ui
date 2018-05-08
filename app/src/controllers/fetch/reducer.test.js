import { FETCH_SUCCESS, INITIAL_STATE } from './constants';
import { fetchReducer } from './reducer';

describe('fetch', () => {
  test('should return initial state', () => {
    const reducer = fetchReducer('test');
    expect(reducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const reducer = fetchReducer('test');
    const oldState = { foo: 1 };
    expect(reducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should support setting initial state', () => {
    const initialState = {};
    const reducer = fetchReducer('test', { initialState });
    expect(reducer(undefined, {})).toBe(initialState);
  });

  test('should return old state on unknown namespace', () => {
    const reducer = fetchReducer('test');
    const oldState = { foo: 1 };
    expect(
      reducer(oldState, {
        type: FETCH_SUCCESS,
        payload: { foo: 2 },
        meta: { namespace: 'foo' },
      }),
    ).toBe(oldState);
  });

  test('should handle FETCH_SUCCESS', () => {
    const initialState = {};
    const reducer = fetchReducer('test', { initialState });
    expect(
      reducer(initialState, {
        type: FETCH_SUCCESS,
        payload: { foo: 1 },
        meta: { namespace: 'test' },
      }),
    ).toEqual({
      foo: 1,
    });
  });

  test('should support contentPath', () => {
    const initialState = {};
    const reducer = fetchReducer('test', { initialState, contentPath: 'bar' });
    expect(
      reducer(initialState, {
        type: FETCH_SUCCESS,
        payload: { foo: 1, bar: { baz: 1 } },
        meta: { namespace: 'test' },
      }),
    ).toEqual({
      baz: 1,
    });
  });
});
