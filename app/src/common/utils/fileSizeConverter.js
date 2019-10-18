/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
