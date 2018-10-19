import { isValueInterrupted, validItemsFilter, getTimeType, getListAverage } from './chartUtils';
import { DURATION } from './constants';

export const prepareChartData = (data) => {
  const chartData = [DURATION];
  const itemData = [];
  let max = 0;
  const average = getListAverage(data.content.result);
  data.content.result.filter(validItemsFilter).forEach((item) => {
    const duration = parseInt(item.values.duration, 10);
    const { id, name, number } = item;
    const { status, start_time, end_time } = item.values;
    max = duration > max ? duration : max;
    itemData.push({
      id,
      name,
      number,
      status,
      start_time,
      end_time,
      duration,
    });
    chartData.push(isValueInterrupted(item.values) ? average : duration);
  });
  return {
    timeType: getTimeType(max),
    chartData,
    itemData,
  };
};
