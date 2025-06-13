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

import { memo } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { FilterOutlineIcon, Table } from '@reportportal/ui-kit';
import { SearchField } from 'components/fields/searchField';
import { TestCase } from './types';
import { TestCaseNameCell } from './testCaseNameCell';
import { TestCaseExecutionCell } from './testCaseExecutionCell';
import { mockTestCases } from './mockData';
import { DEFAULT_CURRENT_PAGE } from './testCaseList.constants';
import { messages } from './messages';
import styles from './testCaseList.scss';

const cx = classNames.bind(styles);

interface TestCaseListProps {
  testCases?: TestCase[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onEdit: () => void;
  onDelete: (testCaseId: string | number) => void;
  onDuplicate: (testCase: TestCase) => void;
  onMove: () => void;
}

export const TestCaseList = memo(
  ({
    testCases = mockTestCases,
    loading = false,
    currentPage = DEFAULT_CURRENT_PAGE,
    itemsPerPage,
    searchValue = '',
    onSearchChange,
    onEdit,
    onDelete,
    onDuplicate,
    onMove,
  }: TestCaseListProps) => {
    const { formatMessage } = useIntl();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = testCases.slice(startIndex, endIndex);

    if (loading) {
      return (
        <div className={cx('test-case-list', 'loading')}>
          <div className={cx('loading-message')}>{formatMessage(messages.loadingMessage)}</div>
        </div>
      );
    }

    const tableData = currentData.map((testCase) => ({
      id: testCase.id,
      name: {
        content: testCase.name,
        component: (
          <TestCaseNameCell status={testCase.status} name={testCase.name} tags={testCase.tags} />
        ),
      },
      lastExecution: {
        content: testCase.lastExecution,
        component: (
          <TestCaseExecutionCell
            lastExecution={testCase.lastExecution}
            onEdit={() => onEdit()}
            onDelete={() => onDelete(testCase.id)}
            onDuplicate={() => onDuplicate(testCase)}
            onMove={() => onMove()}
          />
        ),
      },
    }));

    const primaryColumn = {
      key: 'name',
      header: formatMessage(messages.nameHeader),
      width: 'auto',
      align: 'left' as const,
    };

    const fixedColumns = [
      {
        key: 'lastExecution',
        header: formatMessage(messages.executionHeader),
        width: 164,
        align: 'left' as const,
      },
    ];

    return (
      <div className={cx('test-case-list')}>
        <div className={cx('controls')}>
          <div className={cx('controls-title')}>{formatMessage(messages.allTestCasesTitle)}</div>
          <div className={cx('controls-actions')}>
            <div className={cx('search-section')}>
              <SearchField
                isLoading={loading}
                searchValue={searchValue}
                setSearchValue={onSearchChange}
                onFilterChange={onSearchChange}
                placeholder={formatMessage(messages.searchPlaceholder)}
              />
              <div className={cx('filter-icon')}>
                <FilterOutlineIcon />
              </div>
            </div>
          </div>
        </div>

        {currentData.length > 0 ? (
          <Table
            data={tableData}
            fixedColumns={fixedColumns}
            primaryColumn={primaryColumn}
            sortingColumn={undefined}
            sortableColumns={[]}
            className={cx('test-case-table')}
            rowClassName={cx('test-case-table-row')}
          />
        ) : (
          <div className={cx('no-results')}>
            <div className={cx('no-results-message')}>
              {searchValue
                ? formatMessage(messages.noResultsFilteredMessage)
                : formatMessage(messages.noResultsEmptyMessage)}
            </div>
          </div>
        )}
      </div>
    );
  },
);
