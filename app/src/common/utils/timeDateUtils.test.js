import { getDuration, approximateTimeFormat, dateFormat, daysBetween } from './timeDateUtils';

const NOW = Date.now();
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 3600 * 1000;
const ONE_DAY = 24 * 3600 * 1000;

describe('getDuration', () => {
  test('should return sting', () => {
    expect(typeof getDuration(NOW, NOW + ONE_HOUR)).toBe('string');
  });

  test('should return zero seconds', () => {
    expect(getDuration(NOW, NOW)).toBe('0s');
  });

  test('should contain seconds', () => {
    expect(getDuration(NOW, NOW + ONE_SECOND * 20)).toMatch(/[0-9]+s+/);
  });
  test('should contain minutes', () => {
    expect(getDuration(NOW, NOW + ONE_MINUTE * 20)).toMatch(/[0-9]+m$/);
  });
  test('should contain hours', () => {
    expect(getDuration(NOW, NOW + ONE_HOUR * 20)).toMatch(/[0-9]+h$/);
  });
  test('should contain days', () => {
    expect(getDuration(NOW, NOW + ONE_DAY * 20)).toMatch(/[0-9]+d$/);
  });
  test('should contain days, hours and minutes', () => {
    expect(getDuration(NOW, NOW + (ONE_DAY + ONE_HOUR + ONE_MINUTE + ONE_SECOND) * 20)).toMatch(
      /[0-9]+d [0-9]+h [0-9]+m$/,
    );
  });
  test('should contain minutes and seconds', () => {
    expect(getDuration(NOW, NOW + (ONE_MINUTE + ONE_SECOND) * 20)).toMatch(/[0-9]+m [0-9]+s$/);
  });
});

describe('approximateTimeFormat', () => {
  test('should return sting', () => {
    expect(typeof approximateTimeFormat(NOW + ONE_HOUR)).toBe('string');
  });

  test('should return zero seconds', () => {
    expect(approximateTimeFormat(0)).toBe('0s');
  });

  test('should contain seconds', () => {
    expect(approximateTimeFormat(ONE_SECOND / 1000 * 20)).toMatch(/[0-9]+s+/);
  });
  test('should contain minutes', () => {
    expect(approximateTimeFormat(ONE_MINUTE / 1000 * 20)).toMatch(/[0-9]+m$/);
  });
  test('should contain hours', () => {
    expect(approximateTimeFormat(ONE_HOUR / 1000 * 20)).toMatch(/[0-9]+h$/);
  });
  test('should contain days', () => {
    expect(approximateTimeFormat(ONE_DAY / 1000 * 20)).toMatch(/[0-9]+d$/);
  });
  test('should contain days, hours and minutes', () => {
    expect(
      approximateTimeFormat((ONE_DAY + ONE_HOUR + ONE_MINUTE + ONE_SECOND) / 1000 * 20),
    ).toMatch(/[0-9]+d [0-9]+h [0-9]+m$/);
  });
});

describe('dateFormat', () => {
  test('should return sting', () => {
    expect(typeof dateFormat(0)).toBe('string');
  });
  test('should match match date pattern "@@@@-@@-@@ @@:@@:@@"', () => {
    expect(dateFormat(0)).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/);
  });
  test('should contain UTC', () => {
    expect(dateFormat(0, true)).toMatch(/UTC/);
  });
});

describe('daysBetween', () => {
  test('should return number', () => {
    expect(typeof daysBetween(new Date(), new Date())).toBe('number');
  });
  test('should return zero for equal Dates', () => {
    expect(daysBetween(new Date(), new Date())).toEqual(0);
    expect(daysBetween(new Date(2018, 0, 1), new Date(2018, 0, 1))).toEqual(0);
  });
  test('should return 365 for dates with a year difference', () => {
    expect(daysBetween(new Date(2017, 0, 1), new Date(2018, 0, 1))).toEqual(365);
  });
});
