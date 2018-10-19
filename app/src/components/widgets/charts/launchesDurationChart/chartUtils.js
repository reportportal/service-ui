export const STATUSES = {
  FAILED: 'FAILED',
  STOPPED: 'STOPPED',
  PASSED: 'PASSED',
  INTERRUPTED: 'INTERRUPTED',
};
export const TIME_TYPES = {
  SECONDS: 'seconds',
  MINUTES: 'minutes',
  HOURS: 'hours',
};
export const validStatuses = [STATUSES.FAILED, STATUSES.STOPPED, STATUSES.PASSED];
export const isValueInterrupted = (values) => values.status === STATUSES.INTERRUPTED;
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
export const transformCategoryLabel = (item) => `# ${item.number}`;
export const validItemsFilter = (item) => validStatuses.indexOf(item.values.status) > -1;
export const rangeMaxValue = (itemsLength) => (itemsLength > 6 ? Math.round(itemsLength / 12) : 1);
export const getLaunchAxisTicks = (itemsLength) => {
  const step = rangeMaxValue(itemsLength);
  const array = [];
  for (let iterator = 0; iterator < itemsLength; iterator += step) {
    array.push(iterator);
  }
  return array;
};
export const getListAverage = (data) => {
  let count = 0;
  let sum = 0; // sum of not-interrupted launches duration
  data.filter(validItemsFilter).forEach((item) => {
    if (!isValueInterrupted(item.values)) {
      count += 1;
      sum += +item.values.duration;
    }
  });
  return sum / count;
};
