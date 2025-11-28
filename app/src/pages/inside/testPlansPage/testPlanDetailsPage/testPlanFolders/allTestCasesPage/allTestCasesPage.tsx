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
import { isEmpty } from 'es-toolkit/compat';
import { Pagination } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCaseList } from 'pages/inside/common/testCaseList';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/common/testCaseList/constants';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { usePagination } from 'hooks/usePagination';
import { SelectedTestCaseRow } from 'pages/inside/testCaseLibraryPage/allTestCasesPage/allTestCasesPage';

import styles from './allTestCasesPage.scss';

const cx = createClassnames(styles);

interface AllTestCasesPageProps {
  testCases: ExtendedTestCase[];
  loading: boolean;
  searchValue: string;
  instanceKey: INSTANCE_KEYS;
}

export const AllTestCasesPage = ({
  testCases,
  loading,
  searchValue,
  instanceKey,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
  const { captions, activePage, pageSize, totalPages, setActivePage, changePageSize } =
    usePagination({
      totalItems: testCases.length,
    });
  const [selectedRows, setSelectedRows] = useState<SelectedTestCaseRow[]>([]);

  return (
    <>
      <div className={cx('all-test-cases-page')}>
        <TestCaseList
          testCases={testCases}
          loading={loading}
          currentPage={activePage}
          itemsPerPage={pageSize}
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
        {!isEmpty(testCases) && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={testCases.length}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              changePage={setActivePage}
              changePageSize={changePageSize}
              captions={captions}
            />
          </div>
        )}
      </div>
    </>
  );
};
