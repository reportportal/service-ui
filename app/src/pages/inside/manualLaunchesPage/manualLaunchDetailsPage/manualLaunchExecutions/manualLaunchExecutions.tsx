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
import { SPINNER_DEBOUNCE } from 'pages/inside/common/constants';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useManualLaunchId, useProjectDetails } from 'hooks/useTypedSelector';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import {
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from 'controllers/manualLaunch';

import { ManualLaunchExecutionsProps } from './types';
import { ExecutionStatusChip } from './executionStatusChip';
import { ITEMS_PER_PAGE_OPTIONS } from './constants';
import { useDeleteExecutionModal } from './deleteExecutionModal';
import { messages } from './messages';
import styles from './manualLaunchExecutions.scss';

const cx = createClassnames(styles);

export const ManualLaunchExecutions = ({
  executions,
  pageInfo,
  isLoading,
}: ManualLaunchExecutionsProps) => {
  const { formatMessage } = useIntl();
  const { canManageTestCases } = useUserPermissions();
  const [searchValue, setSearchValue] = useState('');
  const launchId = useManualLaunchId();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { openModal: openDeleteExecutionModal } = useDeleteExecutionModal();

  const { activePage, pageSize, setPageNumber, setPageSize, totalPages, captions } =
    useURLBoundPagination({
      pageData: pageInfo,
      defaultQueryParams: defaultManualLaunchesQueryParams,
      namespace: MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/manualLaunches/${launchId}`,
    });

  const filteredExecutions = useMemo(() => {
    if (!searchValue.trim()) {
      return executions;
    }
    const searchLower = searchValue.toLowerCase();
    return executions?.filter((execution) =>
      execution.testCaseName.toLowerCase().includes(searchLower),
    );
  }, [executions, searchValue]);

  const handleSearchChange = useMemo(
    () =>
      debounce((_value: string) => {
        setPageNumber(1);
      }, SPINNER_DEBOUNCE),
    [setPageNumber],
  );

  const handleFilterClick = () => {
    // TODO: Implement filter functionality
  };

  const handleChangePage = (page: number) => {
    setPageNumber(page);
  };

  const handleChangePageSize = (size: number) => {
    setPageSize(size);
  };

  const handleDeleteExecution = (executionId: number) => {
    const execution = executions.find((exec) => exec.id === executionId);
    if (execution && launchId) {
      openDeleteExecutionModal({ execution, launchId });
    }
  };

  const getPopoverItems = (executionId: number): PopoverItem[] => {
    if (!canManageTestCases) {
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

  const paginatedExecutions = searchValue.trim() ? filteredExecutions : executions;

  const tableData = paginatedExecutions.map((execution) => {
    const stepsCount = execution.manualScenario?.steps?.length ?? null;
    const tags = execution.attributes?.map((attr) => attr.key).filter(Boolean) || [];

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
            {!isEmpty(tags) && (
              <div className={cx('tags-section')}>
                <AdaptiveTagList tags={tags} isShowAllView />
              </div>
            )}
          </div>
        ),
      },
      steps: {
        content: stepsCount ?? '',
        component: (
          <div className={cx('execution-steps-cell')}>{stepsCount === null ? '—' : stepsCount}</div>
        ),
      },
      status: {
        content: execution.executionStatus,
        component: (
          <div className={cx('execution-status-cell')}>
            <ExecutionStatusChip status={execution.executionStatus} />
          </div>
        ),
      },
      actions: {
        content: '',
        component: canManageTestCases ? (
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
    ...(canManageTestCases
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

  const totalItems = pageInfo?.totalElements || 0;
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
                aria-label={formatMessage(messages.filterAriaLabel)}
              >
                <FilterOutlineIcon />
              </button>
            </div>
          </div>
        </div>
        {hasNoSearchResults ? (
          <div className={cx('executions-table-wrapper', 'executions-table-wrapper--empty')}>
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
              headerClassName={cx('executions-table-header')}
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
