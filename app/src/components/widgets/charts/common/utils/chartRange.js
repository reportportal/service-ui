import { range } from 'common/utils/range';

export const rangeMaxValue = (itemsLength) => (itemsLength > 6 ? Math.round(itemsLength / 12) : 1);

export const getLaunchAxisTicks = (itemsLength) =>
  range(0, itemsLength, rangeMaxValue(itemsLength));

export const getTimelineAxisTicks = (itemsLength) => {
  const start = itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0;
  const step = itemsLength > 5 ? (itemsLength / 5).toFixed() : 1;

  return range(start, itemsLength, step);
};
