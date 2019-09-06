import { rangeMaxValue, transformCategoryLabelByDefault, getLaunchAxisTicks } from './utils';

describe('chartUtils', () => {
  describe('rangeMaxValue', () => {
    test('can calculate max value for range of items below or with a length 6', () => {
      expect(rangeMaxValue(5)).toBe(1);
      expect(rangeMaxValue(1)).toBe(1);
      expect(rangeMaxValue(0)).toBe(1);
    });

    test('can calculate max value range for range of items above a length 6', () => {
      expect(rangeMaxValue(7)).toBe(1);
      expect(rangeMaxValue(22)).toBe(2);
      expect(rangeMaxValue(37)).toBe(3);
    });
  });

  describe('transformCategoryLabelByDefault', () => {
    test('can transform label by default (with # character)', () => {
      const item = {
        number: 14,
      };
      expect(transformCategoryLabelByDefault(item)).toBe('#14');
    });
  });

  describe('getLaunchAxisTicks', () => {
    test('can calculate ticks for a range of items', () => {
      expect(getLaunchAxisTicks(1)).toEqual([0]);
      expect(getLaunchAxisTicks(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(getLaunchAxisTicks(22)).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
      expect(getLaunchAxisTicks(37)).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
    });
  });
});
