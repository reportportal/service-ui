const FILE_SIZE_UNITS_DICT = {
  tb: 'TB',
  gb: 'GB',
  mb: 'MB',
  kb: 'KB',
  b: 'b',
};

const FILE_SIZE_BASE = 1000;

export const fileSizeConverter = (size) => {
  const isPositiveInteger = !isNaN(parseFloat(size)) && isFinite(size) && size >= 0;
  if (!isPositiveInteger) {
    throw new Error('You should provide positive integer or zero for this function');
  }
  let cutoff;
  let j = 0;
  let units = ['tb', 'gb', 'mb', 'kb', 'b'];
  const len = units.length;
  let unit;
  let selectedSize = 0;
  let selectedUnit = 'b';

  if (size > 0) {
    units = ['tb', 'gb', 'mb', 'kb', 'b'];
    for (let i = 0; j < len; i += 1, j += 1) {
      unit = units[i];
      cutoff = FILE_SIZE_BASE ** (4 - i) / 10;
      if (size >= cutoff) {
        selectedSize = size / FILE_SIZE_BASE ** (4 - i);
        selectedUnit = unit;
        break;
      }
    }
    selectedSize = Math.round(10 * selectedSize) / 10;
  }
  return `${selectedSize}${FILE_SIZE_UNITS_DICT[selectedUnit]}`;
};
