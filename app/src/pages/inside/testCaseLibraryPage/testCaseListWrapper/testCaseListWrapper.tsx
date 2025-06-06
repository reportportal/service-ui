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

import { useState, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Pagination } from '@reportportal/ui-kit';
import { TestCaseList } from 'components/testCaseList';
import { TestCase } from 'components/testCaseList/testCaseCard/testCaseCard';
import { ITEMS_PER_PAGE_OPTIONS } from 'components/testCaseList/mockData';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from 'components/testCaseList/testCaseList.constants';
import { messages } from '../messages';
import { EmptyState } from '../emptyState';
import styles from './testCaseListWrapper.scss';

const cx = classNames.bind(styles);

interface TestCaseListWrapperProps {
  testCases: TestCase[];
  loading: boolean;
  setTestCases: (testCases: TestCase[] | ((prev: TestCase[]) => TestCase[])) => void;
}

export const TestCaseListWrapper = ({
  testCases,
  loading,
  setTestCases,
}: TestCaseListWrapperProps) => {
  const { formatMessage } = useIntl();
  const [activePage, setActivePage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  // Update filtered test cases when testCases state changes
  const updateFilteredTestCases = useCallback(
    (searchTerm: string = searchValue) => {
      let filtered = testCases;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (testCase) =>
            testCase.name.toLowerCase().includes(term) ||
            testCase.tags.some((tag) => tag.toLowerCase().includes(term)),
        );
      }

      setFilteredTestCases(filtered);
      setActivePage(DEFAULT_CURRENT_PAGE);
    },
    [testCases, searchValue],
  );

  // Update filtered test cases when testCases state changes
  useMemo(() => {
    updateFilteredTestCases();
  }, [updateFilteredTestCases]);

  // Calculate pagination values
  const totalItems = filteredTestCases.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleEdit = useCallback(() => {
    // Here you would implement edit logic
  }, []);

  const handleDelete = useCallback(
    (testCase: TestCase) => {
      // Here you would typically show confirmation modal
      const confirmationMessage = formatMessage(messages.deleteConfirmation, {
        name: testCase.name,
      });
      if (window.confirm(confirmationMessage)) {
        setTestCases((prev) => prev.filter((tc) => tc.id !== testCase.id));
        setFilteredTestCases((prev) => prev.filter((tc) => tc.id !== testCase.id));
      }
    },
    [formatMessage, setTestCases],
  );

  const handleDuplicate = useCallback(
    (testCase: TestCase) => {
      // Here you would implement duplication logic
      const duplicatedTestCase: TestCase = {
        ...testCase,
        id: Date.now(),
        name: `${testCase.name} ${formatMessage(messages.copySuffix)}`,
      };
      setTestCases((prev) => [...prev, duplicatedTestCase]);
      setFilteredTestCases((prev) => [...prev, duplicatedTestCase]);
    },
    [formatMessage, setTestCases],
  );

  const handleMove = useCallback(() => {
    // Here you would implement move logic (show modal with folder selection, etc.)
  }, []);

  const handleSearchChange = useCallback(
    (targetSearchValue: string) => {
      setSearchValue(targetSearchValue);
      updateFilteredTestCases(targetSearchValue);
    },
    [updateFilteredTestCases],
  );

  const changePage = useCallback((page: number) => {
    setActivePage(page);
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setActivePage(DEFAULT_CURRENT_PAGE);
  }, []);

  // Check if we have test cases to determine what to show
  const hasTestCases = testCases && testCases.length > 0;

  // Show empty state if no test cases and not loading
  if (!loading && !hasTestCases) {
    return <EmptyState />;
  }

  return (
    <>
      <div className={cx('test-case-list-wrapper')}>
        <TestCaseList
          testCases={filteredTestCases}
          loading={loading}
          currentPage={activePage}
          itemsPerPage={pageSize}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onFilterChange={handleSearchChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onMove={handleMove}
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
            changePage={changePage}
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
