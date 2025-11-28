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

import { memo, useState } from 'react';
import { useIntl } from 'react-intl';
import { BubblesLoader, FilterOutlineIcon, FilterFilledIcon, Table } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SearchField } from 'components/fields/searchField';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { SelectedTestCaseRow } from 'pages/inside/testCaseLibraryPage/allTestCasesPage/allTestCasesPage';

import { TestCaseNameCell } from './testCaseNameCell';
import { TestCaseExecutionCell } from './testCaseExecutionCell';
import { TestCaseSidePanel } from './testCaseSidePanel';
import { FilterSidePanel } from './filterSidePanel';
import { DEFAULT_CURRENT_PAGE } from './configUtils';
import { messages } from './messages';

import styles from './testCaseList.scss';
import { isEmpty } from 'es-toolkit/compat';

const cx = createClassnames(styles);

interface TestCaseListProps {
  testCases: ExtendedTestCase[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  folderTitle: string;
  searchValue?: string;
  selectedRowIds: (number | string)[];
  selectedRows: SelectedTestCaseRow[];
  handleSelectedRows: (rows: SelectedTestCaseRow[]) => void;
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
    selectedRows,
    handleSelectedRows,
    itemsPerPage,
    searchValue = '',
    onSearchChange,
    folderTitle,
    selectable = true,
    instanceKey,
  }: TestCaseListProps) => {
    const { formatMessage } = useIntl();
    const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);
    const [isFilterSidePanelVisible, setIsFilterSidePanelVisible] = useState(false);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const { canDoTestCaseBulkActions } = useUserPermissions();

    const activeFiltersCount = selectedPriorities.length + selectedTags.length;
    const hasActiveFilters = activeFiltersCount > 0;

    let currentData: ExtendedTestCase[];

    if (currentPage && itemsPerPage) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      currentData = testCases.slice(startIndex, endIndex);
    } else {
      currentData = testCases;
    }

    const handleCloseSidePanel = () => {
      setSelectedTestCaseId(null);
    };

    const handleCloseFilterSidePanel = () => {
      setIsFilterSidePanelVisible(false);
    };

    const handleFilterIconClick = () => {
      setIsFilterSidePanelVisible(true);
    };

    const handleApplyFilters = () => {
      // TODO: Implement apply filters functionality
    };

    const handleRowSelect = (id: number | string) => {
      const testCase = testCases.find((testCase) => testCase.id === id);

      if (!testCase) {
        return;
      }

      const isCurrentlySelected = selectedRows.some((row) => row.id === id);

      handleSelectedRows(
        isCurrentlySelected
          ? selectedRows.filter((row) => row.id !== id)
          : [...selectedRows, { id: testCase.id, folderId: testCase.testFolder.id }],
      );
    };

    const handleSelectAll = () => {
      const currentPageTestCaseIds = currentData.map(({ id }) => id);
      const isAllCurrentPageSelected = currentPageTestCaseIds.every((testCaseId) =>
        selectedRowIds.includes(testCaseId),
      );

      const newSelectedRows = isAllCurrentPageSelected
        ? selectedRows.filter((row) => !currentPageTestCaseIds.includes(row.id))
        : [
            ...selectedRows,
            ...currentData
              .filter((testCase) => !selectedRowIds.includes(testCase.id))
              .map((testCase) => ({ id: testCase.id, folderId: testCase.testFolder.id })),
          ];

      handleSelectedRows(newSelectedRows);
    };

    const selectedTestCase = testCases.find((testCase) => testCase.id === selectedTestCaseId);

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
              tags={testCase?.attributes?.map(({ key }) => key)}
            />
          </button>
        ),
      },
      lastExecution: {
        content: testCase.updatedAt,
        component: (
          <TestCaseExecutionCell
            testCase={testCase}
            instanceKey={instanceKey}
            onRowClick={() => setSelectedTestCaseId(testCase.id)}
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
                  <button
                    type="button"
                    className={cx('filter-icon', { active: hasActiveFilters })}
                    onClick={handleFilterIconClick}
                    aria-label={formatMessage(messages.filterButton)}
                  >
                    {hasActiveFilters ? <FilterFilledIcon /> : <FilterOutlineIcon />}
                    {hasActiveFilters && (
                      <span className={cx('filter-count')}>{activeFiltersCount}</span>
                    )}
                  </button>
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
            {isEmpty(currentData) ? (
              <div className={cx('no-results')}>
                <div className={cx('no-results-message')}>
                  {searchValue
                    ? formatMessage(messages.noResultsFilteredMessage)
                    : formatMessage(messages.noResultsEmptyMessage)}
                </div>
              </div>
            ) : (
              <Table
                selectable={selectable && canDoTestCaseBulkActions}
                onToggleRowSelection={handleRowSelect}
                selectedRowIds={selectedRowIds}
                data={tableData}
                fixedColumns={fixedColumns}
                primaryColumn={primaryColumn}
                sortableColumns={[]}
                onToggleAllRowsSelection={handleSelectAll}
                className={cx('test-case-table')}
                rowClassName={cx('test-case-table-row')}
              />
            )}
            <TestCaseSidePanel
              testCase={selectedTestCase}
              isVisible={!!selectedTestCaseId}
              onClose={handleCloseSidePanel}
            />
            <FilterSidePanel
              isVisible={isFilterSidePanelVisible}
              onClose={handleCloseFilterSidePanel}
              selectedPriorities={selectedPriorities}
              selectedTags={selectedTags}
              onPrioritiesChange={setSelectedPriorities}
              onTagsChange={setSelectedTags}
              onApply={handleApplyFilters}
            />
          </>
        )}
      </div>
    );
  },
);
