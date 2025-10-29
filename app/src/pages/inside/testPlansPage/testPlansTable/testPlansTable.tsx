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

import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Table, ChevronDownDropdownIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { ProgressBar } from './progressBar';
import { TestPlanActions } from '../testPlanActions';
import { TestPlanDto } from 'controllers/testPlan';
import { messages } from './messages';
import {
  useDeleteTestPlanModal,
  useEditTestPlanModal,
  useDuplicateTestPlanModal,
} from '../testPlanModals';

import styles from './testPlansTable.scss';

const cx = createClassnames(styles);

interface TestPlansTableProps {
  testPlans: TestPlanDto[];
}

export const TestPlansTable = ({ testPlans }: TestPlansTableProps) => {
  const { formatMessage, formatNumber } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { openModal: openEditModal } = useEditTestPlanModal();
  const { openModal: openDuplicateModal } = useDuplicateTestPlanModal();
  const { openModal: openDeleteModal } = useDeleteTestPlanModal();

  const handleRowClick = (testPlanId: number) => {
    dispatch({
      type: PROJECT_TEST_PLAN_DETAILS_PAGE,
      payload: { organizationSlug, projectSlug, testPlanId: testPlanId.toString() },
    });
  };

  const getActionHandler = (action: (testPlan: TestPlanDto) => void) => (testPlanId: number) => {
    const actionTestPlan = testPlans.find((testPlan) => testPlan.id === testPlanId);

    if (actionTestPlan) {
      action(actionTestPlan);
    }
  };

  const getOpenTestPlanDetailsButton = (
    testPlanId: number,
    testPlanName: string,
    children: ReactNode,
  ) => (
    <button
      type="button"
      className={cx('test-plans__table-cell-clickable')}
      aria-label={formatMessage(messages.viewTestPlanDetails, { testPlanName })}
      onClick={() => handleRowClick(testPlanId)}
    >
      {children}
    </button>
  );

  const currentTestPlans = testPlans.map(
    ({ id, name, executionStatistic: { total = 0, covered = 0 } }) => {
      const coverage = total === 0 ? 0 : covered / total;

      return {
        id,
        testPlanName: {
          component: getOpenTestPlanDetailsButton(id, name, name),
        },
        coveredTotal: `${covered} / ${total}`,
        coverage: {
          component: (
            <div className={cx('test-plans__table-cell-coverage')}>
              {formatNumber(coverage, {
                style: 'percent',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
          ),
        },
        progressBar: {
          component: <ProgressBar progress={coverage * 100} />,
        },
        options: {
          component: (
            <TestPlanActions
              testPlanId={id}
              variant="table"
              onEdit={getActionHandler(openEditModal)}
              onDuplicate={getActionHandler(openDuplicateModal)}
              onDelete={getActionHandler(openDeleteModal)}
            />
          ),
        },
        icon: {
          component: getOpenTestPlanDetailsButton(id, name, <ChevronDownDropdownIcon />),
        },
      };
    },
  );

  const primaryColumn = {
    key: 'testPlanName',
    header: formatMessage(COMMON_LOCALE_KEYS.NAME),
    width: 520,
    align: 'left' as const,
  };

  const fixedColumns = [
    {
      key: 'coveredTotal',
      header: formatMessage(messages.coveredTotal),
      width: 120,
      align: 'center' as const,
    },
    {
      key: 'progressBar',
      header: '',
      width: 120,
      align: 'center' as const,
    },
    {
      key: 'coverage',
      header: formatMessage(messages.coverage),
      width: 70,
      align: 'left' as const,
    },
    {
      key: 'options',
      header: '',
      width: 60,
      align: 'center' as const,
    },
    {
      key: 'icon',
      header: '',
      width: 50,
      align: 'center' as const,
    },
  ];

  return (
    <div className={cx('test-plans__table-container')}>
      <Table
        data={currentTestPlans}
        fixedColumns={fixedColumns}
        primaryColumn={primaryColumn}
        sortableColumns={[]}
        className={cx('test-plans__table')}
        rowClassName={cx('test-plans__table-row')}
      />
    </div>
  );
};
