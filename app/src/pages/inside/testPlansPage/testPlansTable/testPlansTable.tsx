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

import { ReactNode, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Table, ChevronDownDropdownIcon, Pagination } from '@reportportal/ui-kit';
import { push } from 'redux-first-router';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { locationQuerySelector, PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/common/testCaseList';
import { usePagination } from 'hooks/usePagination';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { defaultQueryParams, TestPlanDto, testPlansPageSelector } from 'controllers/testPlan';

import { ProgressBar } from './progressBar';
import { TestPlanActions } from '../testPlanActions';
import { messages } from './messages';
import {
  useDeleteTestPlanModal,
  useEditTestPlanModal,
  useDuplicateTestPlanModal,
} from '../testPlanModals';
import { PageLoader } from '../pageLoader';
import { queryParamsType } from '../../../../types/common';

import styles from './testPlansTable.scss';

const cx = createClassnames(styles);

interface TestPlansTableProps {
  testPlans: TestPlanDto[];
  isLoading: boolean;
}

export const TestPlansTable = ({ testPlans, isLoading }: TestPlansTableProps) => {
  const { formatMessage, formatNumber } = useIntl();
  const testPlansPageData = useSelector(testPlansPageSelector);
  const { captions, activePage, pageSize, totalPages, setActivePage, changePageSize } =
    usePagination({
      totalItems: testPlansPageData?.totalElements,
      itemsPerPage: defaultQueryParams.limit,
    });
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { openModal: openEditModal } = useEditTestPlanModal();
  const { openModal: openDuplicateModal } = useDuplicateTestPlanModal();
  const { openModal: openDeleteModal } = useDeleteTestPlanModal();
  const query = useSelector(locationQuerySelector);

  useEffect(() => {
    if (query?.limit) {
      changePageSize(Number(query.limit));

      if (query?.offset) {
        setActivePage(Number(query.offset) / Number(query.limit) + 1);
      }
    }
  }, [query?.offset, query?.limit, changePageSize, setActivePage]);

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

  const currentTestPlans = testPlans?.map(
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

  const changeUrlParams = ({ limit, offset }: queryParamsType): void => {
    const url = `/organizations/${organizationSlug}/projects/${projectSlug}/testPlans?
    offset=${offset}&limit=${limit}`;

    push(url);
  };

  const setTestPlansPage = (page: number): void => {
    const offset = (page - 1) * testPlansPageData.size;

    if (offset !== Number(query?.offset)) {
      changeUrlParams({ limit: pageSize, offset });
    }
  };

  const setTestPlansPageSize = (pageSize: number): void => {
    if (pageSize !== Number(query?.limit)) {
      changeUrlParams({ limit: pageSize, offset: defaultQueryParams.offset });
    }
  };

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
            changePage={setTestPlansPage}
            changePageSize={setTestPlansPageSize}
            captions={captions}
          />
        </div>
      )}
    </>
  );
};
