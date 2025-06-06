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

import { useState, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { TestCaseList, mockTestCases } from 'components/testCaseList';
import { Pagination } from 'components/testCaseList/pagination/pagination';
import { ITEMS_PER_PAGE_OPTIONS } from 'components/testCaseList/mockData';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from 'components/testCaseList/testCaseList.constants';

import { BreadcrumbsTreeIcon } from '@reportportal/ui-kit';
import { EmptyState } from './emptyState';

import styles from './testCaseLibraryPage.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [filteredTestCases, setFilteredTestCases] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // Simulate data loading
  useEffect(() => {
    const loadTestCases = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, use mock data
      // In real implementation, you would fetch from API
      setTestCases(mockTestCases);
      setFilteredTestCases(mockTestCases);
      setLoading(false);
    };

    loadTestCases();
  }, []);

  // Calculate pagination values
  const totalItems = filteredTestCases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleEdit = useCallback(() => {
    // Here you would implement edit logic
  }, []);

  const handleDelete = useCallback(
    (testCase) => {
      // Here you would typically show confirmation modal
      const confirmationMessage = formatMessage(messages.deleteConfirmation, {
        name: testCase.name,
      });
      if (window.confirm(confirmationMessage)) {
        setTestCases((prev) => prev.filter((tc) => tc.id !== testCase.id));
        setFilteredTestCases((prev) => prev.filter((tc) => tc.id !== testCase.id));
      }
    },
    [formatMessage],
  );

  const handleDuplicate = useCallback(
    (testCase) => {
      // Here you would implement duplication logic
      const duplicatedTestCase = {
        ...testCase,
        id: Date.now(),
        name: `${testCase.name} ${formatMessage(messages.copySuffix)}`,
      };
      setTestCases((prev) => [...prev, duplicatedTestCase]);
      setFilteredTestCases((prev) => [...prev, duplicatedTestCase]);
    },
    [formatMessage],
  );

  const handleMove = useCallback(() => {
    // Here you would implement move logic (show modal with folder selection, etc.)
  }, []);

  const handleSearchChange = useCallback(
    (targetSearchValue) => {
      setSearchValue(targetSearchValue);
      let filtered = testCases;

      if (targetSearchValue.trim()) {
        const searchTerm = targetSearchValue.toLowerCase();
        filtered = filtered.filter(
          (testCase) =>
            testCase.name.toLowerCase().includes(searchTerm) ||
            testCase.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        );
      }

      setFilteredTestCases(filtered);
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    },
    [testCases],
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((items) => {
    setItemsPerPage(items);
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, []);

  const hasTestCases = testCases && testCases.length > 0;

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('test-case-library-page')}>
          <div className={cx('test-case-library-page__header')}>
            <div className={cx('test-case-library-page__breadcrumb')}>
              <div className={cx('test-case-library-page__breadcrumb-icon')}>
                <BreadcrumbsTreeIcon />
              </div>
              <div className={cx('test-case-library-page__breadcrumb-name')}>Adi_02</div>
            </div>
            <Header title={formatMessage(messages.testCaseLibraryHeader)} />
          </div>
          <div className={cx('test-case-library-page__content')}>
            {hasTestCases ? (
              <TestCaseList
                testCases={filteredTestCases}
                loading={loading}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
              />
            ) : (
              <EmptyState />
            )}
          </div>
          {hasTestCases && totalItems > 0 && (
            <div className={cx('test-case-library-page__pagination')}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
