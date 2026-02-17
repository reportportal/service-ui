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

import { memo, useEffect, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { BubblesLoader, FilterOutlineIcon, FilterFilledIcon, Table } from '@reportportal/ui-kit';

import { createClassnames, debounce } from 'common/utils';
import { SearchField } from 'components/fields/searchField';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { SelectedTestCaseRow } from 'pages/inside/testCaseLibraryPage/allTestCasesPage/allTestCasesPage';
import { locationSelector } from 'controllers/pages/typed-selectors';
import {
  TEST_CASE_LIBRARY_PAGE,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestPlanSidePanel } from 'pages/inside/testPlansPage/testPlanSidePanel';
import { DEFAULT_CURRENT_PAGE } from 'pages/inside/common/testCaseList/configUtils';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { EmptyPageState } from 'pages/common';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SEARCH_DELAY } from 'common/constants/delayTime';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';

import { TestCaseNameCell } from './testCaseNameCell';
import { TestCaseExecutionCell } from './testCaseExecutionCell';
import { TestCaseSidePanel } from './testCaseSidePanel';
import { FilterSidePanel } from './filterSidePanel';
import { messages } from './messages';

import styles from './testCaseList.scss';

const cx = createClassnames(styles);

interface TestCaseListProps {
  testCases: ExtendedTestCase[];
  isLoading?: boolean;
  folderTitle: string;
  activePage?: number;
  selectedRowIds: (number | string)[];
  selectedRows: SelectedTestCaseRow[];
  selectable?: boolean;
  instanceKey: TMS_INSTANCE_KEY;
  handleSelectedRows: (rows: SelectedTestCaseRow[]) => void;
}

export const TestCaseList = memo(
  ({
    testCases,
    isLoading = false,
    selectedRowIds,
    selectedRows,
    folderTitle,
    selectable = true,
    instanceKey,
    handleSelectedRows,
    activePage,
  }: TestCaseListProps) => {
    const { formatMessage } = useIntl();
    const location = useSelector(locationSelector);
    const [searchValue, setSearchValue] = useState(location?.query?.testCasesSearchParams || '');
    const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);
    const [isFilterSidePanelVisible, setIsFilterSidePanelVisible] = useState(false);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const dispatch = useDispatch();
    const { canDoTestCaseBulkActions } = useUserPermissions();

    useEffect(() => {
      setSearchValue(location?.query?.testCasesSearchParams || '');
    }, [folderTitle, location]);

    const activeFiltersCount =
      (isEmpty(selectedPriorities) ? 0 : 1) + (isEmpty(selectedTags) ? 0 : 1);
    const hasActiveFilters = activeFiltersCount > 0;

    const isTestLibraryRoute = location.type === TEST_CASE_LIBRARY_PAGE;
    const isTestPlanRoute = location.type === PROJECT_TEST_PLAN_DETAILS_PAGE;

    const handleFilterChange = useCallback(
      // eslint-disable-next-line react-hooks/use-memo
      debounce((value: string) => {
        dispatch(
          updatePagePropertiesAction({
            testCasesSearchParams: value,
            ...(activePage !== DEFAULT_CURRENT_PAGE && {
              ...TestCasePageDefaultValues,
              testCasesSearchParams: value,
            }),
          }),
        );
      }, SEARCH_DELAY),
      [activePage],
    );

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
      const currentPageTestCaseIds = testCases.map(({ id }) => id);
      const isAllCurrentPageSelected = currentPageTestCaseIds.every((testCaseId) =>
        selectedRowIds.includes(testCaseId),
      );

      const newSelectedRows = isAllCurrentPageSelected
        ? selectedRows.filter((row) => !currentPageTestCaseIds.includes(row.id))
        : [
            ...selectedRows,
            ...testCases
              .filter((testCase) => !selectedRowIds.includes(testCase.id))
              .map((testCase) => ({ id: testCase.id, folderId: testCase.testFolder.id })),
          ];

      handleSelectedRows(newSelectedRows);
    };

    const selectedTestPlan = testCases.find((testCase) => testCase.id === selectedTestCaseId);

    const tableData = testCases.map((testCase) => ({
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
        width: instanceKey === TMS_INSTANCE_KEY.TEST_CASE ? 164 : 190,
        align: 'left' as const,
      },
    ];

    return (
      <div className={cx('test-case-list')}>
        <div className={cx('controls')}>
          <div className={cx('controls-title')}>{folderTitle}</div>
          <div className={cx('controls-actions')}>
            <div className={cx('search-section')}>
              <SearchField
                isLoading={isLoading}
                searchValue={searchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                setSearchValue={setSearchValue}
                onFilterChange={handleFilterChange}
              />
              <button
                type="button"
                className={cx('filter-icon', { active: hasActiveFilters })}
                aria-label={formatMessage(messages.filterButton)}
                onClick={handleFilterIconClick}
              >
                {hasActiveFilters ? (
                  <>
                    <FilterFilledIcon />
                    <span className={cx('filter-count')}>{activeFiltersCount}</span>
                  </>
                ) : (
                  <FilterOutlineIcon />
                )}
              </button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className={cx('test-case-list', 'loading')}>
            <BubblesLoader />
          </div>
        ) : (
          <>
            {isEmpty(testCases) ? (
              <div
                className={cx('no-results', {
                  'no-results--search': searchValue,
                })}
              >
                <div className={cx('no-results-message')}>
                  {searchValue ? (
                    <EmptyPageState
                      label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
                      description={formatMessage(messages.noResultsDescription)}
                      emptyIcon={NoResultsIcon as unknown as string}
                    />
                  ) : (
                    formatMessage(messages.noResultsEmptyMessage)
                  )}
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
                isSelectAllCheckboxAlwaysVisible
              />
            )}
            {isTestLibraryRoute && (
              <TestCaseSidePanel
                testCase={selectedTestPlan}
                isVisible={!!selectedTestCaseId}
                onClose={handleCloseSidePanel}
              />
            )}
            {isTestPlanRoute && (
              <TestPlanSidePanel
                testPlan={selectedTestPlan}
                isVisible={!!selectedTestCaseId}
                onClose={handleCloseSidePanel}
              />
            )}
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
