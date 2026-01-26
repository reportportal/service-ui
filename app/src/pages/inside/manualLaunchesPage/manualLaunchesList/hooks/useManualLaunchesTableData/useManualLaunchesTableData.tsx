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

import { Dispatch, SetStateAction, useMemo, KeyboardEvent, useCallback, MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { RowData } from '@reportportal/ui-kit/components/table/types';

import { AbsRelTime } from 'components/main/absRelTime';
import { SegmentStatus, SegmentedStatusBar } from 'components/statusBar';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { isEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';
import { MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';

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
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();

  const navigateToDetails = useCallback(
    (id: number) => {
      dispatch({
        type: MANUAL_LAUNCH_DETAILS_PAGE,
        payload: { organizationSlug, projectSlug, launchId: id.toString() },
      });
    },
    [dispatch, organizationSlug, projectSlug],
  );

  const getHandlers = useCallback(
    ({ id, handler }: { id: number; handler: (id: number) => void }) => ({
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        handler(id);
      },
      onKeyDown: (event: KeyboardEvent) => {
        if (isEnterOrSpaceKey(event)) {
          event.preventDefault();

          handler(id);
        }
      },
    }),
    [],
  );

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
          const isSelected = id === selectedLaunchId;

          const navigateToDetailsHandlers = getHandlers({
            id,
            handler: navigateToDetails,
          });

          const openSidePanelHandlers = getHandlers({
            id,
            handler: setSelectedLaunchId,
          });

          const baseCellProps = {
            role: 'button' as const,
            tabIndex: 0,
            className: cx('cell-content', { selected: isSelected }),
          };

          const hoverableCellProps = {
            ...baseCellProps,
            className: cx('cell-content', 'manual-launches-list-table-cell-hoverable', {
              selected: isSelected,
            }),
          };

          return {
            id,
            count: {
              content: count,
              component: (
                <div {...baseCellProps} {...navigateToDetailsHandlers}>
                  <CountTag
                    count={count}
                    className={cx(
                      'manual-launches-list-table-cell-count',
                      'manual-launches-list-table-cell-hoverable',
                    )}
                  />
                </div>
              ),
            },
            name: {
              content: name,
              component: (
                <div {...hoverableCellProps} {...navigateToDetailsHandlers}>
                  {name}
                </div>
              ),
            },
            startTime: {
              content: startTime,
              component: (
                <div {...baseCellProps} {...openSidePanelHandlers}>
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
                <div {...baseCellProps} {...openSidePanelHandlers}>
                  {totalTests}
                </div>
              ),
            },
            testRunStatus: {
              content: testsToRun,
              component: (
                <div {...baseCellProps} {...openSidePanelHandlers}>
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
                <div {...baseCellProps} {...openSidePanelHandlers}>
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
    [data, selectedLaunchId, getHandlers, navigateToDetails, setSelectedLaunchId, formatMessage],
  );
};
