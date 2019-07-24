export function range(start = 0, stop, step = 1) {
  if (arguments.length <= 1) {
    stop = start; // eslint-disable-line
  }

  const length = Math.max(Math.ceil((stop - start) / step), 0);
  let idx = 0;
  const arr = new Array(length);

  while (idx < length) {
    arr[idx++] = start; // eslint-disable-line
    start += step; // eslint-disable-line
  }

  return arr;
}
