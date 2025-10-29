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

import { RowData } from '@reportportal/ui-kit/dist/components/table/types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { AbsRelTime } from 'components/main/absRelTime/absRelTime';
import { SegmentStatus, SegmentedStatusBar } from 'components/statusBar';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { TestRunButton } from '../../testRunButton/testRunButton';
import { CountTag } from '../../countTag';
import { ManualTestCase } from '../../../types';

import styles from '../../manualLaunchesList.scss';

const cx = createClassnames(styles);

export const useManualLaunchesTableData = (data: ManualTestCase[]): RowData[] => {
  const { formatMessage } = useIntl();

  return useMemo(
    () =>
      data.map(
        ({
          count,
          name,
          id,
          startTime,
          totalTests,
          failedTests,
          skippedTests,
          testsToRun,
          successTests,
        }) => ({
          id,
          count: {
            content: count,
            component: (
              <CountTag count={count} className={cx('manual-launches-list-table-cell-count')} />
            ),
          },
          name,
          startTime: {
            content: startTime,
            component: startTime ? (
              <AbsRelTime
                startTime={startTime}
                customClass={cx('manual-launches-list-table-cell-time')}
              />
            ) : (
              <span aria-label={formatMessage(COMMON_LOCALE_KEYS.NOT_APPLICABLE)}>
                {formatMessage(COMMON_LOCALE_KEYS.NOT_APPLICABLE)}
              </span>
            ),
          },
          totalTests,
          testRunStatus: {
            content: testsToRun,
            component: (
              <SegmentedStatusBar
                data={[
                  { status: SegmentStatus.Passed, value: successTests ?? 0 },
                  { status: SegmentStatus.Failed, value: failedTests ?? 0 },
                  { status: SegmentStatus.Skipped, value: skippedTests ?? 0 },
                ]}
                className={cx('manual-launches-list-table-cell-status')}
              />
            ),
          },
          failedTests: {
            content: failedTests,
            component: (
              <span className={cx('manual-launches-list-table-cell-failed-tests')}>
                {failedTests}
              </span>
            ),
          },
          testsToRun: {
            content: testsToRun,
            component: <TestRunButton count={testsToRun} />,
          },
        }),
      ),
    [data, formatMessage],
  );
};
