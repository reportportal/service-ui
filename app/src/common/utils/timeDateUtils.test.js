/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  getDuration,
  approximateTimeFormat,
  dateFormat,
  daysBetween,
  getTimestampFromMinutes,
  getMinutesFromTimestamp,
  hoursToSeconds,
  daysToSeconds,
  secondsToHours,
  hoursToDays,
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
    expect(approximateTimeFormat((ONE_SECOND / 1000) * 20)).toEqual('20s');
  });
  test('should return "20m" in case of the 20 minutes timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat((ONE_MINUTE / 1000) * 20)).toEqual('20m');
  });
  test('should return "20h" in case of the 20 hours timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat((ONE_HOUR / 1000) * 20)).toEqual('20h');
  });
  test('should return "20d" in case of the 20 days timestamp (in seconds) is passed as argument', () => {
    expect(approximateTimeFormat((ONE_DAY / 1000) * 20)).toEqual('20d');
  });
  test('should return "20d 20h 20m" in case of the 20 days, 20 hours 20 minutes and 20 seconds timestamp (in seconds) is passed as argument', () => {
    expect(
      approximateTimeFormat(((ONE_DAY + ONE_HOUR + ONE_MINUTE + ONE_SECOND) / 1000) * 20),
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

describe('hoursToSeconds', () => {
  it('converts 1 hour to 3600 seconds', () => {
    expect(hoursToSeconds(1)).toBe(3600);
  });

  it('converts 2.5 hours to 9000 seconds', () => {
    expect(hoursToSeconds(2.5)).toBe(9000);
  });
});

describe('daysToSeconds', () => {
  it('converts 1 day to 86400 seconds', () => {
    expect(daysToSeconds(1)).toBe(86400);
  });

  it('converts 0.5 days to 43200 seconds', () => {
    expect(daysToSeconds(0.5)).toBe(43200);
  });
});

describe('secondsToHours', () => {
  it('converts 3600 seconds to 1 hour', () => {
    expect(secondsToHours(3600)).toBe(1);
  });

  it('converts 9000 seconds to 2.5 hours', () => {
    expect(secondsToHours(9000)).toBe(2.5);
  });
});

describe('hoursToDays', () => {
  it('converts 24 hours to 1 day', () => {
    expect(hoursToDays(24)).toBe(1);
  });

  it('converts 36 hours to 1.5 days', () => {
    expect(hoursToDays(36)).toBe(1.5);
  });
});
