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

import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';

export const getPercentage = (value, totalItems) => ((value / totalItems) * 100).toFixed(2);

export const getChartViewModeOptions = (viewMode, isPreview, totalItems) =>
  viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW]
    ? {
        bar: {
          width: {
            ratio: 0.35,
          },
        },
        padding: {
          top: isPreview ? 0 : 30,
          left: 20,
          right: 20,
          bottom: 0,
        },
        axis: {
          rotated: true,
          x: {
            show: false,
          },
          y: {
            show: false,
            padding: {
              top: 0,
            },
          },
          bar: {
            width: {
              ratio: 0.35,
            },
          },
        },
      }
    : {
        pie: {
          label: {
            show: !isPreview,
            threshold: 0.05,
            format: (value) => `${getPercentage(value, totalItems)}%`,
          },
        },
        padding: {
          top: isPreview ? 0 : 85,
        },
      };

export const calculateTooltipParams = (data, color, customProps) => {
  const { totalItems, formatMessage } = customProps;
  const { id, name, value } = data[0];

  return {
    itemsCount: `${value} (${getPercentage(value, totalItems)}%)`,
    color: color(id),
    issueStatNameProps: { itemName: name, defectTypes: {}, formatMessage },
  };
};
