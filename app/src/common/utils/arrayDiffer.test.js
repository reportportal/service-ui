import { arrayDiffer } from './arrayDiffer';

describe('arrayDiffer', () => {
  test('should return empty array in case of no arguments', () => {
    expect(arrayDiffer()).toEqual([]);
  });
  test('should return first argument in case of no other arguments', () => {
    expect(arrayDiffer([1, 2, 3])).toEqual([1, 2, 3]);
  });
  test('should return array of values form first argument, not from other arguments', () => {
    expect(arrayDiffer([1, 2, 3], [2, 3, 4])).toEqual([1]);
  });
});
