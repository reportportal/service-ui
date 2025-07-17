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

import { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Pagination } from '@reportportal/ui-kit';

import { TestCaseList } from 'pages/inside/testCaseLibraryPage/testCaseList';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/testCaseLibraryPage/testCaseList/mockData';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from 'pages/inside/testCaseLibraryPage/testCaseList/configUtils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { messages } from './messages';

import styles from './allTestCasesPage.scss';

const cx = classNames.bind(styles);

interface AllTestCasesPageProps {
  testCases: TestCase[];
  loading: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const AllTestCasesPage = ({
  testCases,
  loading,
  searchValue,
  setSearchValue,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
  const [activePage, setActivePage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_ITEMS_PER_PAGE);

  // Calculate pagination values
  const totalItems = testCases.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleSearchChange = useCallback(
    (targetSearchValue: string) => {
      setSearchValue(targetSearchValue);
      setActivePage(DEFAULT_CURRENT_PAGE);
    },
    [setSearchValue],
  );

  const changePageSize = (size: number) => {
    setPageSize(size);
    setActivePage(DEFAULT_CURRENT_PAGE);
  };

  return (
    <>
      <div className={cx('all-test-cases-page')}>
        <TestCaseList
          testCases={testCases}
          loading={loading}
          currentPage={activePage}
          itemsPerPage={pageSize}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
      </div>
      {totalItems > 0 && (
        <div className={cx('pagination')}>
          <Pagination
            pageSize={pageSize}
            activePage={activePage}
            totalItems={totalItems}
            totalPages={totalPages}
            pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
            changePage={setActivePage}
            changePageSize={changePageSize}
            captions={{
              items: formatMessage(messages.items),
              of: formatMessage(messages.of),
              page: formatMessage(messages.page),
              goTo: formatMessage(messages.goToPage),
              goAction: formatMessage(messages.go),
              perPage: formatMessage(messages.perPage),
            }}
          />
        </div>
      )}
    </>
  );
};
