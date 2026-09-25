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

import { expect } from '@jest/globals';

/**
 * Shared Jest assertions for single-series trend chart `getOption` output
 * (see `lineTrendChartOption.js`), so per-widget test files don't repeat the
 * same preview-mode / customData checks line for line.
 */

export const expectPreviewModeHidesChart = (option) => {
  expect(option.xAxis.show).toBe(false);
  expect(option.yAxis.show).toBe(false);
  expect(option.yAxis.name).toBeUndefined();
  expect(option.tooltip.show).toBe(false);
  expect(option.grid.top).toBe(8);
  expect(option.grid.left).toBe(8);
};

export const expectSingleSeriesCustomData = (option, { seriesId, color, itemsDataLength }) => {
  expect(option.customData).toMatchObject({
    colors: { [seriesId]: color },
    legendItems: [seriesId],
  });
  expect(option.customData.itemsData).toHaveLength(itemsDataLength);
};
