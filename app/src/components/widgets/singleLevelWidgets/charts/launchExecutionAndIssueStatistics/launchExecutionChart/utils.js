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

import * as COLORS from 'common/constants/colors';
import { getChartData } from '../common/config/utils';

export const getColumns = (content, contentFields, params = {}) => {
  const { separateInterrupted } = params;
  const values = (content[0] || content).values;
  const { itemTypes: chartData, itemColors: colors } = getChartData(values, '$executions$');
  const columns = [];

  chartData.statistics$executions$passed &&
    columns.push(['statistics$executions$passed', chartData.statistics$executions$passed]);
  chartData.statistics$executions$failed &&
    columns.push(['statistics$executions$failed', chartData.statistics$executions$failed]);
  if (separateInterrupted) {
    const interruptedVal = chartData.statistics$executions$interrupted ?? 0;
    columns.push(['statistics$executions$interrupted', interruptedVal]);
    colors.statistics$executions$interrupted =
      colors.statistics$executions$interrupted || COLORS.COLOR_INTERRUPTED;
  }
  chartData.statistics$executions$skipped &&
    columns.push(['statistics$executions$skipped', chartData.statistics$executions$skipped]);

  return {
    columns,
    colors,
  };
};
