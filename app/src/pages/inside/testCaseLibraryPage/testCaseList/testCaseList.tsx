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

import { memo, SetStateAction, useState } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { BubblesLoader, FilterOutlineIcon, Table } from '@reportportal/ui-kit';
import { SearchField } from 'components/fields/searchField';
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { useDispatch, useSelector } from 'react-redux';
import xor from 'lodash.xor';
import { TestCase } from '../types';
import { TestCaseNameCell } from './testCaseNameCell';
import { TestCaseExecutionCell } from './testCaseExecutionCell';
import { TestCaseSidePanel } from './testCaseSidePanel';
import { DEFAULT_CURRENT_PAGE } from './configUtils';
import { messages } from './messages';
import styles from './testCaseList.scss';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

const cx = classNames.bind(styles);

interface TestCaseListProps {
  testCases?: TestCase[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage: number;
  searchValue?: string;
  selectedRowIds: (number | string)[];
  handleSelectedRowIds: (value: SetStateAction<(number | string)[]>) => void;
  onSearchChange?: (value: string) => void;
}

export const TestCaseList = memo(
  ({
    testCases,
    loading = false,
    currentPage = DEFAULT_CURRENT_PAGE,
    selectedRowIds,
    handleSelectedRowIds,
    itemsPerPage,
    searchValue = '',
    onSearchChange,
  }: TestCaseListProps) => {
    const { formatMessage } = useIntl();
    const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);

    const dispatch = useDispatch();
    const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = testCases.slice(startIndex, endIndex);

    const handleRowClick = (testCaseId: number) => {
      setSelectedTestCaseId(testCaseId);
    };

    const handleCloseSidePanel = () => {
      setSelectedTestCaseId(null);
    };

    const handleRowSelect = (id: number | string) => {
      handleSelectedRowIds((selectedRows) => xor(selectedRows, [id]));
    };

    const handleAllSelect = () => {
      handleSelectedRowIds((prevSelectedRowIds) => {
        const currentDataIds: (string | number)[] = currentData.map((row) => row.id);
        if (currentDataIds.every((rowId) => prevSelectedRowIds.includes(rowId))) {
          return prevSelectedRowIds.filter(
            (selectedRowId) => !currentDataIds.includes(selectedRowId),
          );
        }

        return [
          ...prevSelectedRowIds,
          ...currentDataIds.filter((id) => !prevSelectedRowIds.includes(id)),
        ];
      });
    };

    const selectedTestCase = testCases.find((testCase) => testCase.id === selectedTestCaseId);

    if (loading) {
      return (
        <div className={cx('test-case-list', 'loading')}>
          <BubblesLoader />
        </div>
      );
    }

    const tableData = currentData.map((testCase) => ({
      id: testCase.id,
      name: {
        content: testCase.name,
        component: (
          <button
            type="button"
            className={cx('cell-wrapper', { selected: testCase.id === selectedTestCaseId })}
            onClick={() => handleRowClick(testCase.id)}
          >
            <TestCaseNameCell
              priority={testCase.priority?.toLowerCase() as TestCasePriority}
              name={testCase.name}
              tags={testCase.tags?.map(({ key }) => key)}
            />
          </button>
        ),
      },
      lastExecution: {
        content: testCase.updatedAt,
        component: (
          <TestCaseExecutionCell
            lastExecution={testCase.updatedAt}
            onRowClick={() => setSelectedTestCaseId(testCase.id)}
            onEditTestCase={() =>
              dispatch({
                type: TEST_CASE_LIBRARY_PAGE,
                payload: {
                  testCasePageRoute: ['folder', testCase.testFolder.id, 'test-cases', testCase.id],
                  organizationSlug,
                  projectSlug,
                },
              })
            }
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

    const isEmptyList = (value: TestCase[]) => !value.length || value.length === 0;

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
        {!isEmptyList(currentData) ? (
          <Table
            selectable
            onToggleRowSelection={handleRowSelect}
            selectedRowIds={selectedRowIds}
            data={tableData}
            fixedColumns={fixedColumns}
            primaryColumn={primaryColumn}
            sortableColumns={[]}
            onToggleAllRowsSelection={handleAllSelect}
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
        <TestCaseSidePanel
          testCase={selectedTestCase}
          isVisible={!!selectedTestCaseId}
          onClose={handleCloseSidePanel}
        />
      </div>
    );
  },
);
