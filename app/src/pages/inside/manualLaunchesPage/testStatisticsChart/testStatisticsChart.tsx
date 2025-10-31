/*
 * Copyright 2025 EPAM Systems
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

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';

import { messages } from './messages';
import styles from './testStatisticsChart.scss';

const cx = createClassnames(styles);

interface TestStatisticsChartProps {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  inProgress: number;
  toRun: number;
}

export const TestStatisticsChart = ({
  total,
  passed,
  failed,
  skipped,
  inProgress,
  toRun,
}: TestStatisticsChartProps) => {
  const { formatMessage } = useIntl();

  const maxValue = Math.max(passed, failed, skipped, inProgress, toRun);
  const chartHeight = 70; // Height available for bars

  const getBarHeight = (value: number): number => {
    if (maxValue === 0) return 0;
    const calculatedHeight = (value / maxValue) * chartHeight;
    // Ensure minimum height for visibility
    return Math.max(calculatedHeight, 8);
  };

  const columns = [
    {
      label: formatMessage(messages.passed),
      value: passed,
      colorClass: 'passed',
    },
    {
      label: formatMessage(messages.failed),
      value: failed,
      colorClass: 'failed',
    },
    {
      label: formatMessage(messages.progress),
      value: inProgress,
      colorClass: 'in-progress',
    },
    {
      label: formatMessage(messages.skipped),
      value: skipped,
      colorClass: 'skipped',
    },
    {
      label: formatMessage(messages.toRun),
      value: toRun,
      colorClass: 'to-run',
    },
  ];

  return (
    <div className={cx('test-statistics-chart')}>
      <div className={cx('chart-header')}>
        <div className={cx('total-value')}>{total}</div>
        <div className={cx('total-label')}>{formatMessage(messages.totalTests)}</div>
      </div>
      <div className={cx('chart-divider')} />
      <div className={cx('chart-body')}>
        {columns.map((column) => (
          <div key={column.label} className={cx('chart-column')}>
            <div className={cx('column-bar-wrapper')}>
              <div
                className={cx('column-bar')}
                style={{ height: `${getBarHeight(column.value)}px` }}
              >
                <div className={cx('column-badge', column.colorClass)}>
                  <span className={cx('badge-value')}>{column.value}</span>
                </div>
              </div>
            </div>
            <div className={cx('column-label')}>{column.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
