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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Pagination } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestCaseList } from 'pages/inside/common/testCaseList';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/common/testCaseList/constants';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SelectedTestCaseRow } from 'pages/inside/testCaseLibraryPage/allTestCasesPage/allTestCasesPage';
import {
  defaultTestPlanTestCasesQueryParams,
  TEST_PLAN_TEST_CASES_NAMESPACE,
  testPlanTestCasesPageSelector,
} from 'controllers/testPlan';
import { payloadSelector } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';

import styles from './allTestCasesPage.scss';

const cx = createClassnames(styles);

interface AllTestCasesPageProps {
  testCases: ExtendedTestCase[];
  loading: boolean;
  searchValue: string;
  instanceKey: TMS_INSTANCE_KEY;
}

export const AllTestCasesPage = ({
  testCases,
  loading,
  searchValue,
  instanceKey,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
  const testPlansTestCasesPageData = useSelector(testPlanTestCasesPageSelector);
  const payload = useSelector(payloadSelector);
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { setPageNumber, setPageSize, captions, activePage, pageSize, totalPages } =
    useURLBoundPagination({
      pageData: testPlansTestCasesPageData,
      defaultQueryParams: defaultTestPlanTestCasesQueryParams,
      namespace: TEST_PLAN_TEST_CASES_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/milestones/${payload.testPlanId}`,
    });
  const [selectedRows, setSelectedRows] = useState<SelectedTestCaseRow[]>([]);

  return (
    <>
      <div className={cx('all-test-cases-page')}>
        <TestCaseList
          testCases={testCases}
          loading={loading}
          searchValue={searchValue}
          selectedRowIds={selectedRows.map((row) => row.id)}
          selectedRows={selectedRows}
          handleSelectedRows={setSelectedRows}
          folderTitle={formatMessage(COMMON_LOCALE_KEYS.ALL_TEST_CASES_TITLE)}
          selectable={false}
          instanceKey={instanceKey}
        />
      </div>
      <div className={cx('sticky-wrapper')}>
        {Boolean(testPlansTestCasesPageData?.totalElements) && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={testPlansTestCasesPageData.totalElements}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              changePage={setPageNumber}
              changePageSize={setPageSize}
              captions={captions}
            />
          </div>
        )}
      </div>
    </>
  );
};
