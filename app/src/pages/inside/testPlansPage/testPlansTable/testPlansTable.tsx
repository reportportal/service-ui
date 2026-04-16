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

import { ReactNode, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Table, ChevronDownDropdownIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { TestPlanDto } from 'controllers/testPlan';

import { FIXED_COLUMN_WIDTH_PX } from './constants';
import { messages } from './messages';
import {
  useDeleteTestPlanModal,
  useEditTestPlanModal,
  useDuplicateTestPlanModal,
} from '../testPlanModals';
import { PageLoader } from '../pageLoader';
import { useTestPlansTableData } from './hooks';

import type { TestPlansTableProps } from './types';

import styles from './testPlansTable.scss';

const cx = createClassnames(styles);

export const TestPlansTable = ({
  testPlans,
  isLoading,
  showTestPlanBusinessId = true,
}: TestPlansTableProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const dispatch = useDispatch();
  const { openModal: openEditModal } = useEditTestPlanModal();
  const { openModal: openDuplicateModal } = useDuplicateTestPlanModal();
  const { openModal: openDeleteModal } = useDeleteTestPlanModal();

  const testPlansById = useMemo(
    () => new Map<number, TestPlanDto>(testPlans?.map((testPlan) => [testPlan.id, testPlan])),
    [testPlans],
  );

  const handleRowClick = useCallback(
    (testPlanId: number) => {
      dispatch({
        type: PROJECT_TEST_PLAN_DETAILS_PAGE,
        payload: { organizationSlug, projectSlug, testPlanId: testPlanId.toString() },
      });
    },
    [dispatch, organizationSlug, projectSlug],
  );

  const getActionHandler = (action: (testPlan: TestPlanDto) => void) => (testPlanId: number) => {
    const actionTestPlan = testPlansById.get(testPlanId);

    if (actionTestPlan) {
      action(actionTestPlan);
    }
  };

  const getOpenTestPlanDetailsButton = useCallback(
    (testPlanId: number, testPlanName: string, children: ReactNode, kind: 'name' | 'chevron') => (
      <button
        type="button"
        className={cx('test-plans__table-cell-clickable', {
          'test-plans__table-cell-clickable_name': kind === 'name',
          'test-plans__table-cell-clickable_chevron': kind === 'chevron',
        })}
        aria-label={formatMessage(messages.viewTestPlanDetails, { testPlanName })}
        onClick={() => handleRowClick(testPlanId)}
      >
        {children}
      </button>
    ),
    [formatMessage, handleRowClick],
  );

  const { data: testPlansTableData } = useTestPlansTableData({
    testPlans,
    onEdit: getActionHandler(openEditModal),
    onDuplicate: getActionHandler(openDuplicateModal),
    onDelete: getActionHandler(openDeleteModal),
  });

  const currentTestPlans = useMemo(
    () =>
      testPlansTableData.map((row) => {
        const rowTestPlan = testPlansById.get(row.id as number);
        const testPlanName = rowTestPlan?.name || '';
        const testPlanDisplayId = rowTestPlan?.displayId;

        const nameCell = showTestPlanBusinessId ? (
          <span className={cx('test-plans__plan-name-row')}>
            {testPlanDisplayId ? (
              <span className={cx('test-plans__plan-business-id')}>{testPlanDisplayId}</span>
            ) : null}
            <span className={cx('test-plans__plan-name')}>{testPlanName}</span>
          </span>
        ) : (
          <span className={cx('test-plans__plan-name')}>{testPlanName}</span>
        );

        const contentForRow = showTestPlanBusinessId
          ? [testPlanDisplayId, testPlanName].filter(Boolean).join(' ')
          : testPlanName;

        return {
          ...row,
          testPlanName: {
            ...row.testPlanName,
            content: contentForRow,
            component: getOpenTestPlanDetailsButton(row.id as number, testPlanName, nameCell, 'name'),
          },
          icon: {
            component: getOpenTestPlanDetailsButton(
              row.id as number,
              testPlanName,
              <ChevronDownDropdownIcon />,
              'chevron',
            ),
          },
        };
      }),
    [getOpenTestPlanDetailsButton, showTestPlanBusinessId, testPlansById, testPlansTableData],
  );

  const primaryColumn = useMemo(
    () => ({
      key: 'testPlanName' as const,
      header: formatMessage(messages.testPlanNameColumn),
      /* ui-kit: primary uses minmax(width, 1fr); large min width forces horizontal scroll */
      width: 1,
      align: 'left' as const,
    }),
    [formatMessage],
  );

  const fixedColumns = useMemo(
    () => [
      {
        key: 'coveredTotal' as const,
        header: formatMessage(messages.coveredTotal),
        width: FIXED_COLUMN_WIDTH_PX.coveredTotal,
        align: 'left' as const,
      },
      {
        key: 'progressBar' as const,
        header: '',
        width: FIXED_COLUMN_WIDTH_PX.progressBar,
        align: 'center' as const,
      },
      {
        key: 'coverage' as const,
        header: formatMessage(messages.coverage),
        width: FIXED_COLUMN_WIDTH_PX.coverage,
        align: 'left' as const,
      },
      {
        key: 'options' as const,
        header: '',
        width: FIXED_COLUMN_WIDTH_PX.options,
        align: 'center' as const,
      },
      {
        key: 'icon' as const,
        header: '',
        width: FIXED_COLUMN_WIDTH_PX.icon,
        align: 'center' as const,
      },
    ],
    [formatMessage],
  );

  return (
    <div className={cx('test-plans__table-container')}>
      {isLoading ? (
        <PageLoader />
      ) : (
        <Table
          data={currentTestPlans}
          fixedColumns={fixedColumns}
          primaryColumn={primaryColumn}
          sortableColumns={[]}
          className={cx('test-plans__table')}
          rowClassName={cx('test-plans__table-row')}
          headerClassName={cx('test-plans__table-header')}
        />
      )}
    </div>
  );
};
