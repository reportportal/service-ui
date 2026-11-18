/*
 * Copyright 2026 EPAM Systems
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

import { COLOR_WHITE_TWO } from 'common/constants/colors';

export const BAR_SEGMENT_STYLE = { borderColor: COLOR_WHITE_TWO, borderWidth: 1 };
export const BAR_SEGMENT_STYLE_PREVIEW = { ...BAR_SEGMENT_STYLE, borderWidth: 0.5 };

const BAR_TOP_RADIUS = [3, 3, 0, 0];
const BAR_TOP_RADIUS_PREVIEW = [2, 2, 0, 0];

export const getVisibleNames = (itemNames, hiddenItems = []) =>
  itemNames.filter((name) => !hiddenItems.includes(name));

export const withTopRounding = ({
  itemNames,
  dataByName,
  isPreview,
  hiddenItems = [],
  mapValue = (value) => value,
}) => {
  const visibleNames = getVisibleNames(itemNames, hiddenItems);
  const count = itemNames.length ? dataByName[itemNames[0]].length : 0;
  const topSeriesByIndex = Array.from({ length: count }, (_, index) => {
    for (let i = visibleNames.length - 1; i >= 0; i -= 1) {
      if (dataByName[visibleNames[i]][index] > 0) return visibleNames[i];
    }
    return null;
  });

  return Object.fromEntries(
    itemNames.map((name) => [
      name,
      dataByName[name].map((value, index) => {
        if (!value) return null;
        const drawnValue = mapValue(value);
        return topSeriesByIndex[index] === name
          ? {
              value: drawnValue,
              itemStyle: { borderRadius: isPreview ? BAR_TOP_RADIUS_PREVIEW : BAR_TOP_RADIUS },
            }
          : drawnValue;
      }),
    ]),
  );
};
