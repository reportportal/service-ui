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

import { messages } from './messages';
import {
  useDeleteTestPlanModal,
  useEditTestPlanModal,
  useDuplicateTestPlanModal,
} from '../testPlanModals';
import { PageLoader } from '../pageLoader';
import { useTestPlansTableData } from './hooks';

import styles from './testPlansTable.scss';

const cx = createClassnames(styles);

interface TestPlansTableProps {
  testPlans: TestPlanDto[];
  isLoading: boolean;
}

export const TestPlansTable = ({ testPlans, isLoading }: TestPlansTableProps) => {
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
        const testPlanName = testPlansById.get(row.id as number)?.name || '';

        return {
          ...row,
          testPlanName: {
            component: getOpenTestPlanDetailsButton(
              row.id as number,
              testPlanName,
              <span className={cx('test-plans__plan-name')}>{testPlanName}</span>,
              'name',
            ),
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
    [getOpenTestPlanDetailsButton, testPlansById, testPlansTableData],
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
        width: 111,
        align: 'right' as const,
      },
      {
        key: 'progressBar' as const,
        header: '',
        width: 92,
        align: 'center' as const,
      },
      {
        key: 'coverage' as const,
        header: formatMessage(messages.coverage),
        width: 95,
        align: 'right' as const,
      },
      {
        key: 'options' as const,
        header: '',
        width: 36,
        align: 'center' as const,
      },
      {
        key: 'icon' as const,
        header: '',
        width: 39,
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
