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
import { AbsRelTime } from 'components/main/absRelTime/absRelTime';
import { CountTag } from '../../countTag';
import { StatusBar, Status } from 'components/statusBar';
import classNames from 'classnames/bind';
import styles from '../../manualLaunchesList.scss';
import { TestRunButton } from '../../testRunButton/testRunButton';
import { ManualTestCase } from '../../../manualLaunchesPage.types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

const cx = classNames.bind(styles) as typeof classNames;

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
              <CountTag count={count} customClass={cx('manual-launches-list-table-cell-count')} />
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
              <span>{formatMessage(COMMON_LOCALE_KEYS.NOT_APPLICABLE)}</span>
            ),
          },
          totalTests,
          testRunStatus: {
            content: testsToRun,
            component: (
              <StatusBar
                data={[
                  { status: Status.Passed, value: successTests },
                  { status: Status.Failed, value: failedTests },
                  { status: Status.Skipped, value: skippedTests },
                ]}
                customClass={cx('manual-launches-list-table-cell-status')}
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
