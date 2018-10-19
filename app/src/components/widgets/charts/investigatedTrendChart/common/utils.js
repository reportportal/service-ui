import * as COLORS from 'common/constants/colors';

const getRange = (start, stop, step) => {
  const rangeArr = [];

  for (let i = start; i < stop; i += step) {
    rangeArr.push(i);
  }

  return rangeArr;
};

export const getLaunchAxisTicks = (itemsLength) => {
  const step = itemsLength > 6 ? Math.round(itemsLength / 12) : 1;

  return getRange(0, itemsLength, step);
};

export const getTimelineAxisTicks = (itemsLength) => {
  const step = itemsLength > 5 ? (itemsLength / 5).toFixed() : 1;
  const start = itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0;

  return getRange(start, itemsLength, step);
};

export const getColor = (label) => {
  const key = `COLOR_${label.toUpperCase()}`;

  if (COLORS[key] !== undefined) {
    return COLORS[key];
  }
  throw new Error(`Color with key "${key}" is not defined in constants.`);
};
