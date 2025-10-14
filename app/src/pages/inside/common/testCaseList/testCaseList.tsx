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
import { xor } from 'es-toolkit';
import { BubblesLoader, FilterOutlineIcon, Table } from '@reportportal/ui-kit';

import { SearchField } from 'components/fields/searchField';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useEditTestCaseModal } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/useEditTestCaseModal';

import { TestCaseNameCell } from './testCaseNameCell';
import { TestCaseExecutionCell } from './testCaseExecutionCell';
import { TestCaseSidePanel } from './testCaseSidePanel';
import { DEFAULT_CURRENT_PAGE } from './configUtils';
import { messages } from './messages';

import styles from './testCaseList.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface TestCaseListProps {
  testCases: ExtendedTestCase[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage: number;
  folderTitle: string;
  searchValue?: string;
  selectedRowIds: (number | string)[];
  handleSelectedRowIds: (value: SetStateAction<(number | string)[]>) => void;
  onSearchChange?: (value: string) => void;
  selectable?: boolean;
  instanceKey: INSTANCE_KEYS;
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
    folderTitle,
    selectable = true,
    instanceKey,
  }: TestCaseListProps) => {
    const { formatMessage } = useIntl();
    const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);

    const { canDoTestCaseBulkActions } = useUserPermissions();
    const { openModal: openEditTestCaseModal } = useEditTestCaseModal();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = testCases.slice(startIndex, endIndex);

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

    const handleEditTestCase = (testCase: ExtendedTestCase) => {
      openEditTestCaseModal({ testCase });
    };

    const tableData = currentData.map((testCase) => ({
      id: testCase.id,
      name: {
        content: testCase.name,
        component: (
          <button
            type="button"
            className={cx('cell-wrapper', { selected: testCase.id === selectedTestCaseId })}
            onClick={() => setSelectedTestCaseId(testCase.id)}
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
            testCase={testCase}
            lastExecution={testCase.updatedAt}
            instanceKey={instanceKey}
            onRowClick={() => setSelectedTestCaseId(testCase.id)}
            onEdit={handleEditTestCase}
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
        width: instanceKey === INSTANCE_KEYS.TEST_CASE ? 164 : 190,
        align: 'left' as const,
      },
    ];

    const isEmptyList = (value: ExtendedTestCase[]) => !value.length || value.length === 0;

    return (
      <div className={cx('test-case-list')}>
        <div className={cx('controls')}>
          <div className={cx('controls-title')}>{folderTitle}</div>
          <div className={cx('controls-actions')}>
            <div className={cx('search-section')}>
              {loading ? null : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className={cx('test-case-list', 'loading')}>
            <BubblesLoader />
          </div>
        ) : (
          <>
            {!isEmptyList(currentData) ? (
              <Table
                selectable={selectable && canDoTestCaseBulkActions}
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
          </>
        )}
      </div>
    );
  },
);
