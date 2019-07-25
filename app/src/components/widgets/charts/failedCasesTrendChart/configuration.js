import { range } from 'common/utils';

export const getTicks = (bottom, top) => {
  const count = 6; // change it if want to increase/decrease Y-lines
  const height = top - bottom;
  let step;
  const result = [bottom];
  switch (true) {
    case height < 1:
      step = 0.2;
      break;
    case height < 10:
      step = 2;
      break;
    default:
      step = Math.round(height / count / 10) * 10;
      break;
  }
  range(0, top, step || 1).forEach((item) => {
    if (item > bottom) {
      result.push(item);
    }
  });
  result.push(top);
  return result;
};
