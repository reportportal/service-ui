/*
 * Copyright 2026 EPAM Systems
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

import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { FilterOutlineIcon, Pagination, MeatballMenuIcon, Table } from '@reportportal/ui-kit';

import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { SearchField } from 'components/fields/searchField';
import { createClassnames, debounce } from 'common/utils';
import { EmptyPageState } from 'pages/common';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { usePagination } from 'hooks/usePagination';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

import { ManualLaunchExecutionsProps } from './types';
import { ExecutionStatusChip, ExecutionStatus } from './executionStatusChip';
import { ITEMS_PER_PAGE_OPTIONS, DEFAULT_PAGE_SIZE } from './constants';
import { useDeleteExecutionModal } from './deleteExecutionModal';
import { messages } from './messages';
import styles from './manualLaunchExecutions.scss';

const cx = createClassnames(styles);

export const ManualLaunchExecutions = ({ executions, isLoading }: ManualLaunchExecutionsProps) => {
  const { formatMessage } = useIntl();
  const { canEditTestCase } = useUserPermissions();
  const [searchValue, setSearchValue] = useState('');
  const launchId = useManualLaunchId();
  const { openModal: openDeleteExecutionModal } = useDeleteExecutionModal();

  const filteredExecutions = useMemo(() => {
    if (!searchValue.trim()) {
      return executions;
    }
    const searchLower = searchValue.toLowerCase();
    return executions?.filter((execution) =>
      execution.testCaseName.toLowerCase().includes(searchLower),
    );
  }, [executions, searchValue]);

  const { captions, activePage, pageSize, totalPages, setActivePage, changePageSize } =
    usePagination({
      totalItems: filteredExecutions?.length || 0,
      itemsPerPage: DEFAULT_PAGE_SIZE,
    });

  const handleSearchChange = useMemo(
    () =>
      debounce((_value: string) => {
        setActivePage(1);
      }, 300),
    [setActivePage],
  );

  const handleFilterClick = () => {
    // TODO: Implement filter functionality
  };

  const paginatedExecutions = useMemo(() => {
    const maxPage = Math.max(1, Math.ceil((filteredExecutions?.length || 0) / pageSize));
    const safePage = Math.min(activePage, maxPage);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredExecutions?.slice(startIndex, endIndex) || [];
  }, [filteredExecutions, activePage, pageSize]);

  const handleChangePage = (page: number) => {
    setActivePage(page);
  };

  const handleChangePageSize = (size: number) => {
    changePageSize(size);
    setActivePage(1);
  };

  const handleDeleteExecution = (executionId: number) => {
    const execution = executions.find((exec) => exec.id === executionId);
    if (execution && launchId) {
      openDeleteExecutionModal({ execution, launchId });
    }
  };

  const getPopoverItems = (executionId: number): PopoverItem[] => {
    if (!canEditTestCase) {
      return [];
    }

    return [
      {
        label: formatMessage(messages.deleteExecution),
        onClick: () => handleDeleteExecution(executionId),
        variant: 'destructive',
      },
    ];
  };

  const tableData = paginatedExecutions.map((execution) => {
    const stepsCount = execution.manualScenario?.steps?.length ?? null;
    const tags = execution.attributes?.map((attr) => attr.key) || [];

    return {
      id: execution.id,
      name: {
        content: execution.testCaseName,
        component: (
          <div className={cx('execution-name-cell')}>
            <div className={cx('first-row')}>
              {execution.testCasePriority && (
                <PriorityIcon priority={execution.testCasePriority as TestCasePriority} />
              )}
              <span className={cx('test-name')}>{execution.testCaseName}</span>
            </div>
            {tags.length > 0 && (
              <div className={cx('tags-section')}>
                <AdaptiveTagList tags={tags} isShowAllView />
              </div>
            )}
          </div>
        ),
      },
      steps: {
        content: stepsCount || '',
        component: (
          <div className={cx('execution-steps-cell')}>{stepsCount !== null ? stepsCount : '—'}</div>
        ),
      },
      status: {
        content: execution.executionStatus || ExecutionStatus.TO_RUN,
        component: (
          <div className={cx('execution-status-cell')}>
            <ExecutionStatusChip
              status={execution.executionStatus}
              startedAt={execution.startedAt}
            />
          </div>
        ),
      },
      actions: {
        content: '',
        component: canEditTestCase ? (
          <div className={cx('execution-actions-cell')}>
            <PopoverControl items={getPopoverItems(execution.id)} placement="bottom-end">
              <button type="button" className={cx('execution-actions-button')}>
                <MeatballMenuIcon />
              </button>
            </PopoverControl>
          </div>
        ) : null,
      },
    };
  });

  const primaryColumn = {
    key: 'name',
    header: formatMessage(messages.nameColumn),
    width: 'auto',
    align: 'left' as const,
  };

  const fixedColumns = [
    {
      key: 'steps',
      header: formatMessage(messages.stepsColumn),
      width: 75,
      align: 'left' as const,
    },
    {
      key: 'status',
      header: formatMessage(messages.statusColumn),
      width: 64,
      align: 'left' as const,
    },
    ...(canEditTestCase
      ? [
          {
            key: 'actions',
            header: '',
            width: 40,
            align: 'center' as const,
          },
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <div className={cx('manual-launch-executions__loader')}>
        <SpinningPreloader />
      </div>
    );
  }

  if (isEmpty(executions)) {
    return (
      <div className={cx('manual-launch-executions__empty')}>
        <EmptyPageState
          emptyIcon={NoResultsIcon as unknown as string}
          label={formatMessage(messages.noExecutions)}
        />
      </div>
    );
  }

  const totalItems = filteredExecutions?.length || 0;
  const hasNoSearchResults = isEmpty(filteredExecutions) && !isEmpty(executions);

  return (
    <>
      <div className={cx('manual-launch-executions')}>
        <div className={cx('controls')}>
          <div className={cx('controls-title')}>{formatMessage(messages.allTestExecutions)}</div>
          <div className={cx('controls-actions')}>
            <div className={cx('search-section')}>
              <SearchField
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                onFilterChange={handleSearchChange}
                placeholder={formatMessage(messages.searchPlaceholder)}
                isLoading={false}
              />
              <button
                type="button"
                className={cx('filter-icon')}
                onClick={handleFilterClick}
                aria-label="Filter"
              >
                <FilterOutlineIcon />
              </button>
            </div>
          </div>
        </div>

        {hasNoSearchResults ? (
          <div className={cx('executions-table-wrapper')}>
            <EmptyPageState
              emptyIcon={NoResultsIcon as unknown as string}
              label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
              description={formatMessage(messages.noResultsDescription)}
            />
          </div>
        ) : (
          <div className={cx('executions-table-wrapper')}>
            <Table
              data={tableData}
              fixedColumns={fixedColumns}
              primaryColumn={primaryColumn}
              sortableColumns={[]}
              className={cx('executions-table')}
              bodyClassName={cx('executions-table-body')}
              rowClassName={cx('execution-chip')}
            />
          </div>
        )}
      </div>

      <div className={cx('manual-launch-executions__pagination')}>
        <Pagination
          pageSize={pageSize}
          activePage={activePage}
          totalItems={totalItems}
          totalPages={totalPages}
          pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
          changePage={handleChangePage}
          changePageSize={handleChangePageSize}
          captions={captions}
        />
      </div>
    </>
  );
};
