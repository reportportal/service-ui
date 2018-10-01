import { omit } from './omit';

describe('utils/omit', () => {
  test('should return a new object', () => {
    const oldObject = { foo: 3, bar: 4 };
    expect(omit(oldObject, ['foo'])).not.toBe(oldObject);
  });

  test('should return empty object in case of no arguments', () => {
    expect(() => omit()).not.toThrow();
    expect(omit()).toEqual({});
  });

  test('should not modify incoming arguments', () => {
    const oldObject = { foo: 3, bar: 4 };
    const keys = ['foo'];
    omit(oldObject, keys);
    expect(oldObject).toEqual({ foo: 3, bar: 4 });
    expect(keys).toEqual(['foo']);
  });

  test('should return object without excluded keys', () => {
    const oldObject = { foo: 3, bar: 4, baz: 'baz' };
    expect(omit(oldObject, ['foo'])).toEqual({ bar: 4, baz: 'baz' });
  });
});
