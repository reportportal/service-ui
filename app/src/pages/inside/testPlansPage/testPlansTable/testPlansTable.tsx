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

import { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Table, ChevronDownDropdownIcon, Pagination } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/common/testCaseList';
import { useProjectDetails } from 'hooks/useTypedSelector';
import {
  defaultQueryParams,
  TEST_PLANS_NAMESPACE,
  TestPlanDto,
  testPlansPageSelector,
} from 'controllers/testPlan';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';

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
  const testPlansPageData = useSelector(testPlansPageSelector);
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { setPageNumber, setPageSize, captions, activePage, pageSize, totalPages } =
    useURLBoundPagination({
      pageData: testPlansPageData,
      namespace: TEST_PLANS_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/milestones`,
      defaultQueryParams,
    });
  const dispatch = useDispatch();
  const { openModal: openEditModal } = useEditTestPlanModal();
  const { openModal: openDuplicateModal } = useDuplicateTestPlanModal();
  const { openModal: openDeleteModal } = useDeleteTestPlanModal();

  const testPlansById = useMemo(
    () => new Map<number, TestPlanDto>(testPlans?.map((testPlan) => [testPlan.id, testPlan])),
    [testPlans],
  );

  const handleRowClick = (testPlanId: number) => {
    dispatch({
      type: PROJECT_TEST_PLAN_DETAILS_PAGE,
      payload: { organizationSlug, projectSlug, testPlanId: testPlanId.toString() },
    });
  };

  const getActionHandler = (action: (testPlan: TestPlanDto) => void) => (testPlanId: number) => {
    const actionTestPlan = testPlansById.get(testPlanId);

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

  const { data: testPlansTableData } = useTestPlansTableData({
    testPlans,
    onEdit: getActionHandler(openEditModal),
    onDuplicate: getActionHandler(openDuplicateModal),
    onDelete: getActionHandler(openDeleteModal),
  });

  const currentTestPlans = testPlansTableData.map((row) => {
    const testPlanName = testPlansById.get(row.id as number)?.name || '';

    return {
      ...row,
      testPlanName: {
        component: getOpenTestPlanDetailsButton(row.id as number, testPlanName, testPlanName),
      },
      icon: {
        component: getOpenTestPlanDetailsButton(
          row.id as number,
          testPlanName,
          <ChevronDownDropdownIcon />,
        ),
      },
    };
  });

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
    <>
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
      {Boolean(testPlansPageData?.totalElements) && (
        <div className={cx('pagination-wrapper')}>
          <Pagination
            pageSize={pageSize}
            activePage={activePage}
            totalItems={testPlansPageData.totalElements}
            totalPages={totalPages}
            pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
            changePage={setPageNumber}
            changePageSize={setPageSize}
            captions={captions}
          />
        </div>
      )}
    </>
  );
};
