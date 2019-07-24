import {
  getDuration,
  approximateTimeFormat,
  dateFormat,
  daysBetween,
  getTimestampFromMinutes,
  getMinutesFromTimestamp,
} from './timeDateUtils';

const NOW = Date.now();
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 3600 * 1000;
const ONE_DAY = 24 * 3600 * 1000;

describe('getDuration', () => {
  test('should return string', () => {
    expect(typeof getDuration(NOW, NOW + ONE_HOUR)).toBe('string');
  });

  test('should return "0s" in case of the same start and end', () => {
    expect(getDuration(NOW, NOW)).toBe('0s');
  });

  test('should return "20s" in case of the time difference between start and end is 20 seconds', () => {
    expect(getDuration(NOW, NOW + ONE_SECOND * 20)).toEqual('20s');
  });
  test('should return "20m" in case of the time difference between start and end is 20 minutes', () => {
    expect(getDuration(NOW, NOW + ONE_MINUTE * 20)).toEqual('20m');
  });
  test('should return "20h" in case of the time difference between start and end is 20 hours', () => {
    expect(getDuration(NOW, NOW + ONE_HOUR * 20)).toEqual('20h');
  });
  test('should return "20d" in case of the time difference between start and end is 20 days', () => {
    expect(getDuration(NOW, NOW + ONE_DAY * 20)).toEqual('20d');
  });
  test('should return "20d 20h 20m" in case of the time difference between start and end is 20 days, 20 hours 20 minutes and 20 seconds', () => {
    expect(getDuration(NOW, NOW + (ONE_DAY + ONE_HOUR + ONE_MINUTE + ONE_SECOND) * 20)).toEqual(
      '20d 20h 20m',
    );
  });
  test('should return "20m 20s" in case of the time difference between start and end is 20 minutes and 20 seconds', () => {
    expect(getDuration(NOW, NOW + (ONE_MINUTE + ONE_SECOND) * 20)).toEqual('20m 20s');
  });
});

describe('approximateTimeFormat', () => {
  test('should return sting', () => {
    expect(typeof approximateTimeFormat(NOW + ONE_HOUR)).toBe('string');
  });

  test('should return "0s" in case of 0 timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat(0)).toEqual('0s');
  });

  test('should return "20s" in case of the 20 seconds timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat(ONE_SECOND / 1000 * 20)).toEqual('20s');
  });
  test('should return "20m" in case of the 20 minutes timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat(ONE_MINUTE / 1000 * 20)).toEqual('20m');
  });
  test('should return "20h" in case of the 20 hours timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat(ONE_HOUR / 1000 * 20)).toEqual('20h');
  });
  test('should return "20d" in case of the 20 days timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat(ONE_DAY / 1000 * 20)).toEqual('20d');
  });
  test('should return "20d 20h 20m" in case of the 20 days, 20 hours 20 minutes and 20 seconds timestamp (in seconds) is passed as argument', () => {
    expect(
      approximateTimeFormat((ONE_DAY + ONE_HOUR + ONE_MINUTE + ONE_SECOND) / 1000 * 20),
    ).toEqual('20d 20h 20m');
  });
});

describe('dateFormat', () => {
  test('should return sting', () => {
    expect(typeof dateFormat(0)).toBe('string');
  });
  test('should match match date pattern "@@@@-@@-@@ @@:@@:@@"', () => {
    expect(dateFormat(0)).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/);
  });
  test('should contain UTC offset after date in case second argument is true.', () => {
    expect(dateFormat(0, true)).toMatch(
      /^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} UTC[+-]{0,1}[0-9]{1,2}$/,
    );
  });
});

describe('daysBetween', () => {
  test('should return number', () => {
    expect(typeof daysBetween(new Date(), new Date())).toBe('number');
  });
  test('should return 0 for equal Dates', () => {
    expect(daysBetween(new Date(), new Date())).toEqual(0);
    expect(daysBetween(new Date(2018, 0, 1), new Date(2018, 0, 1))).toEqual(0);
  });
  test('should return 365 for dates with a year difference', () => {
    expect(daysBetween(new Date(2017, 0, 1), new Date(2018, 0, 1))).toEqual(365);
  });
});

describe('getTimestampFromMinutes', () => {
  test('should return number', () => {
    expect(typeof getTimestampFromMinutes(20)).toBe('number');
  });
});

describe('getMinutesFromTimestamp', () => {
  test('should return number', () => {
    expect(typeof getMinutesFromTimestamp(1514754000000)).toBe('number');
  });
});
