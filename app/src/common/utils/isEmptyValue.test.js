import { isEmptyValue } from './isEmptyValue';

describe('isEmptyValue', () => {
  test('should return true for empty string, null and undefined', () => {
    expect(isEmptyValue()).toBe(true);
    expect(isEmptyValue('')).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue(undefined)).toBe(true);
  });

  test('should return false for other values', () => {
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue([])).toBe(false);
    expect(isEmptyValue({})).toBe(false);
    expect(isEmptyValue('abc')).toBe(false);
    expect(isEmptyValue(1)).toBe(false);
  });
});
