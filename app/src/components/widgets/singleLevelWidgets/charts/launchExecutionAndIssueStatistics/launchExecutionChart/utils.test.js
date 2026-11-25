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

import {
  COLOR_CHART_FAILED,
  COLOR_CHART_PASSED,
  COLOR_CHART_SKIPPED,
  COLOR_INTERRUPTED,
} from 'common/constants/colors';
import { getColumns } from './utils';

const content = [
  {
    values: {
      statistics$executions$passed: '60',
      statistics$executions$failed: '30',
      statistics$executions$interrupted: '5',
      statistics$executions$skipped: '3',
    },
  },
];

describe('launchExecutionChart getColumns', () => {
  test('uses Chart tokens for statuses', () => {
    const { colors } = getColumns(content, null, {});

    expect(colors).toEqual({
      statistics$executions$passed: COLOR_CHART_PASSED,
      statistics$executions$failed: COLOR_CHART_FAILED,
      statistics$executions$skipped: COLOR_CHART_SKIPPED,
    });
  });

  test('keeps interrupted color when it is separated', () => {
    const { columns, colors } = getColumns(content, null, { separateInterrupted: true });

    expect(columns.map(([id]) => id)).toContain('statistics$executions$interrupted');
    expect(colors.statistics$executions$interrupted).toBe(COLOR_INTERRUPTED);
  });
});
