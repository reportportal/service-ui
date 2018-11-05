import { rangeMaxValue, getLaunchAxisTicks } from './chartRange';

describe('chartRange', () => {
  describe('rangeMaxValue', () => {
    test('it should return a proper max value for a length lower than 6', () => {
      expect(rangeMaxValue(2)).toEqual(1);
    });
    test('it should return a proper max value for a length between 6 and 12', () => {
      expect(rangeMaxValue(9)).toEqual(1);
    });
    test('it should return a proper max value for a length above 12', () => {
      expect(rangeMaxValue(22)).toEqual(2);
    });
  });
  describe('getLaunchAxisTicks', () => {
    test('it should return an array', () => {
      expect(getLaunchAxisTicks(22)).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });
  });
});
