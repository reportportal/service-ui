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

import * as STATUSES from 'common/constants/testStatuses';
import { duration as calculateDuration } from 'moment';
import { messages } from 'components/widgets/common/messages';

export const DURATION = 'duration';
export const TIME_TYPES = {
  SECONDS: 'seconds',
  MINUTES: 'minutes',
  HOURS: 'hours',
};

export const isValueInterrupted = (item) => item.status === STATUSES.INTERRUPTED;
export const getTimeType = (max) => {
  if (max > 0) {
    if (max < 60000) {
      return { value: 1000, type: TIME_TYPES.SECONDS };
    } else if (max <= 2 * 3600000) {
      return { value: 60000, type: TIME_TYPES.MINUTES };
    }
  }
  return { value: 3600000, type: TIME_TYPES.HOURS };
};
export const getListAverage = (data) => {
  let count = 0;
  let sum = 0; // sum of not-interrupted launches duration
  data.forEach((item) => {
    if (!isValueInterrupted(item)) {
      count += 1;
      sum += +item.duration;
    }
  });
  return sum / count;
};

export const prepareChartData = (data) => {
  const chartData = [DURATION];
  const itemsData = [];
  let max = 0;
  const average = getListAverage(data);
  data.forEach((item) => {
    const duration = parseInt(item.duration, 10);
    const { id, name, number } = item;
    const { status, startTime, endTime } = item;
    max = duration > max ? duration : max;
    itemsData.push({
      id,
      name,
      number,
      status,
      startTime,
      endTime,
      duration,
    });
    // Average value is used for interrupted launches in order to reduce their effect on the duration for normally finished launches
    chartData.push(isValueInterrupted(item) ? average : duration);
  });
  return {
    timeType: getTimeType(max),
    chartData,
    itemsData,
  };
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, timeType, formatMessage } = customProps;
  const { name, number, duration, status } = itemsData[data[0].index];
  const abs = Math.abs(duration / timeType.value);
  const humanDuration = isValueInterrupted({ status })
    ? formatMessage(messages.launchInterrupted)
    : calculateDuration(abs, timeType.type).humanize(true);

  return {
    itemName: `${name} #${number}`,
    duration: humanDuration,
  };
};
