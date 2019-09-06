import * as STATUSES from 'common/constants/testStatuses';
import {
  TIME_TYPES,
  getTimeType,
  validItemsFilter,
  getListAverage,
  isValueInterrupted,
} from './utils';

describe('launchDurationChartUtils', () => {
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

  describe('validItemsFilter', () => {
    test('can filter out valid items', () => {
      const itemStopped = { id: '5bb342ee0274390001975997', status: STATUSES.STOPPED };
      const itemFailed = { id: '5bb342e60274390001974193', status: STATUSES.FAILED };
      const itemInterrupted = { id: '5bb342e50274390001973ec7', status: STATUSES.INTERRUPTED };
      const itemPassed = { id: '5bb342e50274390001973f69', status: STATUSES.PASSED };
      expect(validItemsFilter(itemStopped)).toBe(true);
      expect(validItemsFilter(itemFailed)).toBe(true);
      expect(validItemsFilter(itemInterrupted)).toBe(false);
      expect(validItemsFilter(itemPassed)).toBe(true);
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
