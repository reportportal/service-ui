export const rangeMaxValue = (itemsLength) => (itemsLength > 6 ? Math.round(itemsLength / 12) : 1);

export const getLaunchAxisTicks = (itemsLength) => {
  const step = rangeMaxValue(itemsLength);
  const array = [];
  for (let iterator = 0; iterator < itemsLength; iterator += step) {
    array.push(iterator);
  }
  return array;
};
