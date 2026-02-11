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

import { RowData } from '@reportportal/ui-kit/components/table/types';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { AbsRelTime } from 'components/main/absRelTime';
import { SegmentStatus, SegmentedStatusBar } from 'components/statusBar';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { isEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';

import { TestRunButton } from '../../testRunButton/testRunButton';
import { CountTag } from '../../countTag';
import { ManualTestCase } from '../../../types';

import styles from '../../manualLaunchesList.scss';

const cx = createClassnames(styles);

export const useManualLaunchesTableData = (
  data: ManualTestCase[],
  selectedLaunchId: number | null,
  setSelectedLaunchId: Dispatch<SetStateAction<number | null>>,
): RowData[] => {
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
          inProgressTests,
        }) => {
          const handleRowClick = () => setSelectedLaunchId(id);
          const isSelected = id === selectedLaunchId;
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (isEnterOrSpaceKey(e)) {
              e.preventDefault();
              handleRowClick();
            }
          };

          return {
            id,
            count: {
              content: count,
              component: (
                <div
                  className={cx('cell-content', { selected: isSelected })}
                  onClick={handleRowClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <CountTag count={count} className={cx('manual-launches-list-table-cell-count')} />
                </div>
              ),
            },
            name: {
              content: name,
              component: (
                <div
                  className={cx('cell-content', { selected: isSelected })}
                  onClick={handleRowClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  {name}
                </div>
              ),
            },
            startTime: {
              content: startTime,
              component: (
                <div
                  className={cx('cell-content', { selected: isSelected })}
                  onClick={handleRowClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  {startTime ? (
                    <AbsRelTime
                      startTime={startTime}
                      customClass={cx('manual-launches-list-table-cell-time')}
                    />
                  ) : (
                    <span aria-label={formatMessage(COMMON_LOCALE_KEYS.NOT_APPLICABLE)}>
                      {formatMessage(COMMON_LOCALE_KEYS.NOT_APPLICABLE)}
                    </span>
                  )}
                </div>
              ),
            },
            totalTests: {
              content: totalTests,
              component: (
                <div
                  className={cx('cell-content', { selected: isSelected })}
                  onClick={handleRowClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  {totalTests}
                </div>
              ),
            },
            testRunStatus: {
              content: testsToRun,
              component: (
                <div
                  className={cx('cell-content', { selected: isSelected })}
                  onClick={handleRowClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <SegmentedStatusBar
                    data={[
                      { status: SegmentStatus.Passed, value: successTests ?? 0 },
                      { status: SegmentStatus.Failed, value: failedTests ?? 0 },
                      { status: SegmentStatus.Skipped, value: skippedTests ?? 0 },
                      { status: SegmentStatus.InProgress, value: inProgressTests ?? 0 },
                      { status: SegmentStatus.ToRun, value: testsToRun ?? 0 },
                    ]}
                    className={cx('manual-launches-list-table-cell-status')}
                  />
                </div>
              ),
            },
            failedTests: {
              content: failedTests,
              component: (
                <div
                  className={cx('cell-content', { selected: isSelected })}
                  onClick={handleRowClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <span className={cx('manual-launches-list-table-cell-failed-tests')}>
                    {failedTests}
                  </span>
                </div>
              ),
            },
            testsToRun: {
              content: testsToRun,
              component: <TestRunButton count={testsToRun} />,
            },
          };
        },
      ),
    [data, formatMessage, selectedLaunchId, setSelectedLaunchId],
  );
};
