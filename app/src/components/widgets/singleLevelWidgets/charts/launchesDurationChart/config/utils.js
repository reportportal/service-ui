import * as STATUSES from 'common/constants/testStatuses';
import { duration as calculateDuration } from 'moment';

export const DURATION = 'duration';
export const TIME_TYPES = {
  SECONDS: 'seconds',
  MINUTES: 'minutes',
  HOURS: 'hours',
};
const validStatuses = [STATUSES.FAILED, STATUSES.STOPPED, STATUSES.PASSED];

export const validItemsFilter = (item) => validStatuses.indexOf(item.status) > -1;
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
  data.filter(validItemsFilter).forEach((item) => {
    count += 1;
    sum += +item.duration;
  });
  return sum / count;
};

export const prepareChartData = (data) => {
  const chartData = [DURATION];
  const itemsData = [];
  let max = 0;
  const average = getListAverage(data.result);
  data.result.filter(validItemsFilter).forEach((item) => {
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
    chartData.push(isValueInterrupted(item) ? average : duration);
  });
  return {
    timeType: getTimeType(max),
    chartData,
    itemsData,
  };
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, timeType } = customProps;
  const { name, number, duration, status, text } = itemsData[data[0].index];
  const abs = Math.abs(duration / timeType.value);
  const humanDuration = calculateDuration(abs, timeType.type).humanize(true);

  return {
    itemName: `${name} #${number}`,
    duration: isValueInterrupted({ status }) ? text.widgets.launchInterrupted : humanDuration,
  };
};
