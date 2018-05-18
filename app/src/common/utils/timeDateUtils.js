/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import moment from 'moment';

const getTimeUnits = (time) => {
  const days = Math.floor(time / 86400);
  const hours = Math.floor((time - days * 86400) / 3600);
  const minutes = Math.floor((time - days * 86400 - hours * 3600) / 60);
  const seconds = time - days * 86400 - hours * 3600 - minutes * 60;
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export const getDuration = (start, end) => {
  const secDuration = parseInt((end - start) / 1000, 10);
  const { days, hours, minutes, seconds } = getTimeUnits(secDuration);

  let result = '';
  if (days > 0) {
    result = `${result + days}d `;
  }
  if (hours > 0) {
    result = `${result + hours}h `;
  }
  if (minutes > 0) {
    result = `${result + minutes}m`;
    if (!days && !hours && seconds) {
      result += ` ${seconds}s`;
    }
  }
  if (result === '' && seconds > 0) {
    result = `${seconds}s`;
  } else if (result === '' && seconds === 0) {
    result = `${Math.round((end - start) / 10) / 100}s`;
  }
  return result.trim();
};

export const approximateTimeFormat = (time) => {
  const { days, hours, minutes, seconds } = getTimeUnits(time);
  let result = '';

  if (days > 0) {
    result = `${result + days}d `;
  }
  if (hours > 0) {
    result = `${result + hours}h `;
  }
  if (minutes > 0) {
    result = `${result + minutes}m`;
  }
  if (result === '' && seconds > 0) {
    result = `${seconds}s`;
  } else if (result === '' && seconds === 0) {
    result = `${Math.round(time / 10) / 100}s`;
  }
  return result.trim();
};

export const dateFormat = (val, withUtc) => {
  const date = new Date(val);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  let utc = date.getTimezoneOffset() / 60 * -1;

  if (utc.toString().indexOf('-') === -1) {
    utc = `UTC+${utc}`;
  } else {
    utc = `UTC${utc}`;
  }

  // normalize value to 2 symbols string
  //   1 -> 01
  //   10 -> 10
  const normalize = (input) => {
    if (String(input).length < 2) {
      return `0${input}`;
    }
    return input;
  };

  return `${date.getFullYear()}-${normalize(month)}-${normalize(day)} ${normalize(
    hour,
  )}:${normalize(minute)}:${normalize(second)}${withUtc ? ` ${utc}` : ''}`;
};

export const fromNowFormat = (date) => moment(date).fromNow();

export const daysFromNow = (stamp) => fromNowFormat(dateFormat(stamp));

export const daysBetween = (date1, date2) => {
  // The number of milliseconds in one day
  const ONE_DAY = 1000 * 60 * 60 * 24;
  // Calculate the difference in milliseconds
  const difference = Math.abs(date1.getTime() - date2.getTime());
  // Convert back to days and return
  return Math.round(difference / ONE_DAY);
};
