import * as STATUSES from 'common/constants/testStatuses';
import { TIME_TYPES, getTimeType, isValueInterrupted } from './utils';

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
});
