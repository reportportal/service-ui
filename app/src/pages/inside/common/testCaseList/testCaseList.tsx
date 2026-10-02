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

import { memo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIntl, type IntlShape } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { isEmpty } from 'es-toolkit/compat';
import { BubblesLoader, Table } from '@reportportal/ui-kit';
import { DragLayer } from '@reportportal/ui-kit/sortable';

import { TEST_CASE_LIBRARY_EVENTS } from 'analyticsEvents/testCaseLibraryPageEvents';
import { createClassnames } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import type { ExtendedTestCase, TestCasePriority } from 'types/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { SelectedTestCaseRow } from './types';
import { locationSelector } from 'controllers/pages/typed-selectors';
import { TEST_CASE_LIBRARY_PAGE, PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestPlanSidePanel } from 'pages/inside/testPlansPage/testPlanSidePanel';
import { LifecycleBadge } from 'pages/inside/aiFactory/common';
import { AiQualityCell } from 'pages/inside/aiFactory/library';
import { EmptyPageState } from 'pages/common';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';

import { EXTERNAL_TREE_DROP_TYPE } from 'pages/inside/common/expandedOptions/constants';
import { DraggableTestCaseNameCell } from './draggableTestCaseNameCell';
import { TestCaseExecutionCell } from './testCaseExecutionCell';
import { TestCaseSidePanel } from './testCaseSidePanel';
import { messages } from './messages';

import styles from './testCaseList.scss';

const cx = createClassnames(styles);

interface TestCaseListProps {
  testCases: ExtendedTestCase[];
  isLoading?: boolean;
  folderTitle: string;
  selectedRowIds: (number | string)[];
  selectedRows: SelectedTestCaseRow[];
  selectable?: boolean;
  instanceKey: TMS_INSTANCE_KEY;
  handleSelectedRows: (rows: SelectedTestCaseRow[]) => void;
  hasAiFilters?: boolean;
}

interface ToggleRowSelectionParams {
  id: number | string;
  testCases: ExtendedTestCase[];
  selectedRows: SelectedTestCaseRow[];
  handleSelectedRows: (rows: SelectedTestCaseRow[]) => void;
}

const toggleRowSelection = ({
  id,
  testCases,
  selectedRows,
  handleSelectedRows,
}: ToggleRowSelectionParams) => {
  const testCase = testCases.find((item) => item.id === id);

  if (!testCase) {
    return;
  }

  const isCurrentlySelected = selectedRows.some((row) => row.id === id);
  const nextSelectedRows = isCurrentlySelected
    ? selectedRows.filter((row) => row.id !== id)
    : [...selectedRows, { id: testCase.id, folderId: testCase.testFolder.id, name: testCase.name }];

  handleSelectedRows(nextSelectedRows);
};

interface ToggleAllRowsSelectionParams {
  testCases: ExtendedTestCase[];
  selectedRowIds: (number | string)[];
  selectedRows: SelectedTestCaseRow[];
  handleSelectedRows: (rows: SelectedTestCaseRow[]) => void;
}

const toggleAllRowsSelection = ({
  testCases,
  selectedRowIds,
  selectedRows,
  handleSelectedRows,
}: ToggleAllRowsSelectionParams) => {
  const currentPageTestCaseIds = testCases.map(({ id }) => id);
  const isAllCurrentPageSelected = currentPageTestCaseIds.every((testCaseId) =>
    selectedRowIds.includes(testCaseId),
  );
  const nextSelectedRows = isAllCurrentPageSelected
    ? selectedRows.filter((row) => !currentPageTestCaseIds.includes(row.id))
    : [
        ...selectedRows,
        ...testCases
          .filter((testCase) => !selectedRowIds.includes(testCase.id))
          .map((testCase) => ({
            id: testCase.id,
            folderId: testCase.testFolder.id,
            name: testCase.name,
          })),
      ];

  handleSelectedRows(nextSelectedRows);
};

const hasAiFactoryData = (
  isAiFactoryEnabled: boolean,
  isTestLibraryRoute: boolean,
  testCases: ExtendedTestCase[],
) =>
  isAiFactoryEnabled && isTestLibraryRoute && testCases.some(({ lifecycle }) => Boolean(lifecycle));

const hasActiveFilters = (
  searchParams: unknown,
  priorities: unknown,
  tags: unknown,
  hasAiFilters: boolean,
) => Boolean(searchParams || priorities || tags || hasAiFilters);

interface CreateTableDataParams {
  formatMessage: IntlShape['formatMessage'];
  handleRowOpen: (testCaseId: number) => void;
  instanceKey: TMS_INSTANCE_KEY;
  searchQuery: string;
  selectedTestCaseId: number | null;
  shouldShowAiFactoryData: boolean;
  testCases: ExtendedTestCase[];
}

const createTableData = ({
  formatMessage,
  handleRowOpen,
  instanceKey,
  searchQuery,
  selectedTestCaseId,
  shouldShowAiFactoryData,
  testCases,
}: CreateTableDataParams) =>
  testCases.map((testCase) => ({
    id: testCase.id,
    name: {
      content: testCase.name,
      component: (
        <div className={cx('cell-wrapper', { selected: testCase.id === selectedTestCaseId })}>
          <button
            type="button"
            className={cx('cell-open-area')}
            title={`${testCase.displayId} ${testCase.name}`}
            aria-label={formatMessage(messages.openTestCase, {
              displayId: testCase.displayId,
              name: testCase.name,
            })}
            onClick={() => handleRowOpen(testCase.id)}
          />
          <DraggableTestCaseNameCell
            testCase={testCase}
            priority={testCase.priority?.toLowerCase() as TestCasePriority}
            name={testCase.name}
            tags={testCase?.attributes?.map(({ key }) => key)}
            searchQuery={searchQuery}
            ai={shouldShowAiFactoryData ? testCase.ai : undefined}
            review={shouldShowAiFactoryData ? testCase.review : undefined}
          />
        </div>
      ),
    },
    lastExecution: {
      content: testCase.updatedAt,
      component: (
        <TestCaseExecutionCell
          testCase={testCase}
          instanceKey={instanceKey}
          onRowClick={() => handleRowOpen(testCase.id)}
        />
      ),
    },
    ...(shouldShowAiFactoryData && {
      status: {
        content: testCase.lifecycle ?? '',
        component: testCase.lifecycle ? (
          <div className={cx('lifecycle-cell')}>
            <LifecycleBadge lifecycle={testCase.lifecycle} />
          </div>
        ) : null,
      },
      aiQuality: {
        content: testCase.evaluationSummary?.totalScore ?? '',
        component: (
          <AiQualityCell
            ai={testCase.ai}
            evaluationSummary={testCase.evaluationSummary}
            costSummary={testCase.costSummary}
          />
        ),
      },
    }),
  }));

const createFixedColumns = (
  formatMessage: IntlShape['formatMessage'],
  instanceKey: TMS_INSTANCE_KEY,
  shouldShowAiFactoryData: boolean,
) => [
  ...(shouldShowAiFactoryData
    ? [
        {
          key: 'status',
          header: formatMessage(messages.statusHeader),
          width: 120,
          align: 'left' as const,
        },
        {
          key: 'aiQuality',
          header: formatMessage(messages.aiQualityHeader),
          width: 184,
          align: 'left' as const,
        },
      ]
    : []),
  {
    key: 'lastExecution',
    header: formatMessage(messages.executionHeader),
    width: instanceKey === TMS_INSTANCE_KEY.TEST_CASE ? 190 : 220,
    align: 'left' as const,
  },
];

interface RenderTestCaseListBodyParams {
  children: ReactNode;
  formatMessage: IntlShape['formatMessage'];
  hasActiveSearchOrFilters: boolean;
  hasAiFilters: boolean;
  isEmpty: boolean;
  isLoading: boolean;
}

const renderTestCaseListBody = ({
  children,
  formatMessage,
  hasActiveSearchOrFilters,
  hasAiFilters,
  isEmpty: isTestCaseListEmpty,
  isLoading,
}: RenderTestCaseListBodyParams) => {
  if (isLoading) {
    return (
      <div className={cx('test-case-list', 'loading')}>
        <BubblesLoader />
      </div>
    );
  }

  if (!isTestCaseListEmpty) {
    return <>{children}</>;
  }

  return (
    <div
      className={cx('no-results', {
        'no-results--search': hasActiveSearchOrFilters,
      })}
    >
      <div className={cx('no-results-message')}>
        {hasActiveSearchOrFilters ? (
          <EmptyPageState
            label={formatMessage(
              hasAiFilters ? messages.noResultsAiFilters : COMMON_LOCALE_KEYS.NO_RESULTS,
            )}
            description={hasAiFilters ? undefined : formatMessage(messages.noResultsDescription)}
            emptyIcon={NoResultsIcon as unknown as string}
          />
        ) : (
          formatMessage(messages.noResultsEmptyMessage)
        )}
      </div>
    </div>
  );
};

interface TestCaseSidePanelPortalProps {
  isTestLibraryRoute: boolean;
  isTestPlanRoute: boolean;
  onClose: () => void;
  selectedTestCase?: ExtendedTestCase;
  selectedTestCaseId: number | null;
}

const TestCaseSidePanelPortal = ({
  isTestLibraryRoute,
  isTestPlanRoute,
  onClose,
  selectedTestCase,
  selectedTestCaseId,
}: TestCaseSidePanelPortalProps) => {
  if (isTestLibraryRoute) {
    return createPortal(
      <TestCaseSidePanel
        testCase={selectedTestCase}
        isVisible={Boolean(selectedTestCaseId)}
        onClose={onClose}
      />,
      document.body,
    );
  }

  if (isTestPlanRoute) {
    return createPortal(
      <TestPlanSidePanel
        testPlan={selectedTestCase}
        isVisible={Boolean(selectedTestCaseId)}
        onClose={onClose}
      />,
      document.body,
    );
  }

  return null;
};

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
    hasAiFilters = false,
  }: TestCaseListProps) => {
    const { formatMessage } = useIntl();
    const { trackEvent } = useTracking();
    const location = useSelector(locationSelector);
    const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);
    const { canManageTestCases } = useUserPermissions();
    const isAiFactoryEnabled = useAiFactoryEnabled();
    const isSelectable = selectable && canManageTestCases;

    const searchQuery = location?.query?.testCasesSearchParams || '';

    const isTestLibraryRoute = location.type === TEST_CASE_LIBRARY_PAGE;
    const isTestPlanRoute = location.type === PROJECT_TEST_PLAN_DETAILS_PAGE;
    const shouldShowAiFactoryData = hasAiFactoryData(
      isAiFactoryEnabled,
      isTestLibraryRoute,
      testCases,
    );

    const handleRowOpen = (testCaseId: number) => {
      if (isTestLibraryRoute && selectedTestCaseId !== testCaseId) {
        trackEvent(TEST_CASE_LIBRARY_EVENTS.clickTestCaseRow(String(testCaseId)));
      }
      setSelectedTestCaseId(testCaseId);
    };

    const handleCloseSidePanel = () => {
      setSelectedTestCaseId(null);
    };

    const handleRowSelect = (id: number | string) => {
      toggleRowSelection({ id, testCases, selectedRows, handleSelectedRows });
    };

    const handleSelectAll = () => {
      toggleAllRowsSelection({ testCases, selectedRowIds, selectedRows, handleSelectedRows });
    };

    const selectedTestPlan = testCases.find((testCase) => testCase.id === selectedTestCaseId);

    const tableData = createTableData({
      formatMessage,
      handleRowOpen,
      instanceKey,
      searchQuery,
      selectedTestCaseId,
      shouldShowAiFactoryData,
      testCases,
    });

    const primaryColumn = {
      key: 'name',
      header: formatMessage(messages.nameHeader),
      width: 'auto',
      align: 'left' as const,
    };

    const fixedColumns = createFixedColumns(formatMessage, instanceKey, shouldShowAiFactoryData);

    const hasActiveSearchOrFilters = hasActiveFilters(
      location?.query?.testCasesSearchParams,
      location?.query?.filterPriorities,
      location?.query?.filterTags,
      hasAiFilters,
    );
    const isTestCaseListEmpty = isEmpty(testCases);
    const showNoSearchResults = !isLoading && isTestCaseListEmpty && hasActiveSearchOrFilters;

    return (
      <div className={cx('test-case-list')}>
        {!showNoSearchResults && (
          <div className={cx('controls')}>
            <div className={cx('controls-title')}>{folderTitle}</div>
          </div>
        )}
        {renderTestCaseListBody({
          formatMessage,
          hasActiveSearchOrFilters,
          hasAiFilters,
          isEmpty: isTestCaseListEmpty,
          isLoading,
          children: (
            <>
              <DragLayer
                type={EXTERNAL_TREE_DROP_TYPE}
                previewClassName={cx('test-case-drag-preview')}
                renderPreview={(item: { id: number | string; testCase?: ExtendedTestCase }) => {
                  const draggedTestCase =
                    item.testCase ?? testCases.find((testCase) => testCase.id === item.id);
                  return (
                    <span className={cx('test-case-drag-preview__text')}>
                      {draggedTestCase?.name}
                    </span>
                  );
                }}
              />
              <Table
                selectable={isSelectable}
                onToggleRowSelection={handleRowSelect}
                selectedRowIds={selectedRowIds}
                data={tableData}
                fixedColumns={fixedColumns}
                primaryColumn={primaryColumn}
                sortableColumns={[]}
                onToggleAllRowsSelection={handleSelectAll}
                className={cx('test-case-table', {
                  'test-case-table_selectable': isSelectable,
                })}
                rowClassName={`${cx('test-case-table-row')} test-case-table-row-global`}
                isSelectAllCheckboxAlwaysVisible
              />
              <TestCaseSidePanelPortal
                isTestLibraryRoute={isTestLibraryRoute}
                isTestPlanRoute={isTestPlanRoute}
                selectedTestCase={selectedTestPlan}
                selectedTestCaseId={selectedTestCaseId}
                onClose={handleCloseSidePanel}
              />
            </>
          ),
        })}
      </div>
    );
  },
);
