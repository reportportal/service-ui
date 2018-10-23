export const rangeMaxValue = (itemsLength) => (itemsLength > 6 ? Math.round(itemsLength / 12) : 1);

export const getLaunchAxisTicks = (itemsLength) => {
  const step = rangeMaxValue(itemsLength);
  const array = [];
  for (let iterator = 0; iterator < itemsLength; iterator += step) {
    array.push(iterator);
  }
  return array;
};

export const getTimelineAxisTicks = (itemsLength) => {
  const start = itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0;
  const step = itemsLength > 5 ? (itemsLength / 5).toFixed() : 1;
  const result = [];
  for (let iterator = start; iterator < itemsLength; iterator += step) {
    result.push(iterator);
  }
  return result;
};
