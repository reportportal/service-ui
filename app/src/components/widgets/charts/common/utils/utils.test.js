import {
  STATUSES,
  TIME_TYPES,
  isValueInterrupted,
  getTimeType,
  transformCategoryLabel,
  validItemsFilter,
  rangeMaxValue,
  getLaunchAxisTicks,
  getListAverage,
} from './utils';

describe('chartUtils', () => {
  describe('isValueInterrupted', () => {
    test('can detect interrupted value', () => {
      const interruptedEntry = {
        status: STATUSES.INTERRUPTED,
      };
      const nonInterruptedEntry = {
        status: STATUSES.STOPPED,
      };
      expect(isValueInterrupted(interruptedEntry)).toBe(true);
      expect(isValueInterrupted(nonInterruptedEntry)).toBe(false);
    });
  });

  describe('getTimeType', () => {
    test('works for a value of 0', () => {
      const expected = { value: 3600000, type: TIME_TYPES.HOURS };
      expect(getTimeType(0)).toEqual(expected);
    });

    test('works for values below 60.000', () => {
      const expected = { value: 1000, type: TIME_TYPES.SECONDS };
      expect(getTimeType(3600)).toEqual(expected);
    });

    test('works for values below 14.400.000', () => {
      const expected = { value: 60000, type: TIME_TYPES.MINUTES };
      expect(getTimeType(720000)).toEqual(expected);
    });
  });

  describe('transformCategoryLabel', () => {
    test('can transform label', () => {
      const item = {
        number: 14,
      };
      expect(transformCategoryLabel(item)).toBe('# 14');
    });
  });

  describe('validItemsFilter', () => {
    test('can filter out valid items', () => {
      const itemStopped = { id: '5bb342ee0274390001975997', status: 'STOPPED' };
      const itemFailed = { id: '5bb342e60274390001974193', status: 'FAILED' };
      const itemInterrupted = { id: '5bb342e50274390001973ec7', status: 'INTERRUPTED' };
      const itemPassed = { id: '5bb342e50274390001973f69', status: 'PASSED' };
      expect(validItemsFilter(itemStopped)).toBe(true);
      expect(validItemsFilter(itemFailed)).toBe(true);
      expect(validItemsFilter(itemInterrupted)).toBe(false);
      expect(validItemsFilter(itemPassed)).toBe(true);
    });
  });

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

  describe('getLaunchAxisTicks', () => {
    test('can calculate ticks for a range of items', () => {
      expect(getLaunchAxisTicks(1)).toEqual([0]);
      expect(getLaunchAxisTicks(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(getLaunchAxisTicks(22)).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
      expect(getLaunchAxisTicks(37)).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
    });
  });

  describe('getListAverage', () => {
    test('can calculate average value from a list of valid items', () => {
      const input = [
        {
          duration: '4607',
          startTime: '1538474734721',
          endTime: '1538474739328',
          status: 'STOPPED',
          name: 'Demo Api Tests__ncst',
          number: '6',
          id: '5bb342ee0274390001975997',
        },
        {
          duration: '1526',
          startTime: '1538474726486',
          endTime: '1538474728012',
          status: 'FAILED',
          name: 'Demo Api Tests__ncst',
          number: '3',
          id: '5bb342e60274390001974193',
        },
        {
          duration: '830',
          startTime: '1538474725654',
          endTime: '1538474726485',
          status: 'PASSED',
          name: 'Demo Api Tests__ncst',
          number: '2',
          id: '5bb342e50274390001973f69',
        },
      ];
      expect(getListAverage(input)).toBe(2321);
    });

    test('can calculate average value from a list of valid and invalid items', () => {
      const input = [
        {
          duration: '4607',
          startTime: '1538474734721',
          endTime: '1538474739328',
          status: 'STOPPED',
          name: 'Demo Api Tests__ncst',
          number: '6',
          id: '5bb342ee0274390001975997',
        },
        {
          duration: '1526',
          startTime: '1538474726486',
          endTime: '1538474728012',
          status: 'FAILED',
          name: 'Demo Api Tests__ncst',
          number: '3',
          id: '5bb342e60274390001974193',
        },
        {
          duration: '830',
          startTime: '1538474725654',
          endTime: '1538474726485',
          status: 'INTERRUPTED',
          name: 'Demo Api Tests__ncst',
          number: '2',
          id: '5bb342e50274390001973f69',
        },
      ];
      expect(getListAverage(input)).toBe(3066.5);
    });
  });
});
