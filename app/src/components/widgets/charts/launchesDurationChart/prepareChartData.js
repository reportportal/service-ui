import { isValueInterrupted, validItemsFilter, getTimeType, getListAverage } from './chartUtils';
import { DURATION } from './constants';

export const prepareChartData = (data) => {
  const chartData = [DURATION];
  const itemData = [];
  let max = 0;
  const average = getListAverage(data.content.result);
  data.content.result.filter(validItemsFilter).forEach((item) => {
    const duration = parseInt(item.duration, 10);
    const { id, name, number } = item;
    const { status, startTime, endTime } = item;
    max = duration > max ? duration : max;
    itemData.push({
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
    itemData,
  };
};
