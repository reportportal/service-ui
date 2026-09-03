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
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { isEmpty, noop, countBy } from 'es-toolkit/compat';
import { Button, MeatballMenuIcon, Pagination, Selection, Tooltip } from '@reportportal/ui-kit';

import {
  TEST_CASE_BULK_OPERATION_ELEMENT_NAME,
  TEST_CASE_LIBRARY_EVENTS,
  type TestCaseBulkOperationElementName,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { createClassnames } from 'common/utils';
import { TestCaseList } from 'pages/inside/common/testCaseList';
import {
  ITEMS_PER_PAGE_OPTIONS,
  TEST_CASE_LIST_NAMESPACE,
  TestCasePageDefaultValues,
} from 'pages/inside/common/testCaseList/constants';
import { TestCase } from 'types/testCase';
import { Page } from 'types/common';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { SelectedTestCaseRow } from 'pages/inside/common/testCaseList/types';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { showModalAction } from 'controllers/modal';
import { locationQuerySelector, payloadSelector, urlFolderIdSelector } from 'controllers/pages';
import { foldersSelector } from 'controllers/testCase';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useHasTestPlans } from 'hooks/useHasTestPlans';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { CHANGE_PRIORITY_MODAL_KEY } from './changePriorityModal';
import { messages } from './messages';
import { FolderEmptyState } from '../emptyState/folder/folderEmptyState';
import { commonMessages } from '../commonMessages';
import { isManualScenarioEmpty } from '../addToLaunchButton/isManualScenarioEmpty';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useBatchDuplicateTestCasesModal } from './batchDuplicateTestCasesModal';
import { useBatchDeleteTestCasesModal } from './batchDeleteTestCasesModal';
import { useMoveTestCaseModal } from '../moveTestCaseModal';
import { useBatchEditTagsModal } from './batchEditTagsModal';
import { useAddToLaunchModal } from '../addToLaunchModal';

import styles from './allTestCasesPage.scss';

const cx = createClassnames(styles);

interface AllTestCasesPageProps {
  testCases: TestCase[];
  testCasesPageData: Page;
  isLoading: boolean;
  instanceKey: TMS_INSTANCE_KEY;
}

export const AllTestCasesPage = ({
  testCases,
  isLoading,
  instanceKey,
  testCasesPageData,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const payload = useSelector(payloadSelector);
  const query = useSelector(locationQuerySelector);
  const { setPageNumber, setPageSize, captions, activePage, pageSize, totalPages } =
    useURLBoundPagination({
      pageData: testCasesPageData,
      defaultQueryParams: TestCasePageDefaultValues,
      namespace: TEST_CASE_LIST_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/testLibrary${payload.testCasePageRoute ? '/' + payload.testCasePageRoute : ''}`,
    });
  const [selectedRows, setSelectedRows] = useState<SelectedTestCaseRow[]>([]);
  const folderId = useSelector(urlFolderIdSelector);
  const folders = useSelector(foldersSelector);
  const dispatch = useDispatch();
  const { openModal: openAddToTestPlanModal } = useAddTestCasesToTestPlanModal();
  const { openModal: openAddToLaunchModal } = useAddToLaunchModal();
  const { openModal: openBatchDuplicateToFolderModal } = useBatchDuplicateTestCasesModal();
  const { openModal: openBatchDeleteTestCasesModal } = useBatchDeleteTestCasesModal();
  const { openModal: openMoveTestCaseModal } = useMoveTestCaseModal();
  const { openModal: openBatchEditTagsModal } = useBatchEditTagsModal();
  const { canManageTestCases } = useUserPermissions();
  const { hasTestPlans } = useHasTestPlans();

  const isAnyRowSelected = !isEmpty(selectedRows);
  const selectedRowIds = useMemo(() => selectedRows.map((row) => row.id), [selectedRows]);

  const isAddToLaunchDisabled = useMemo(() => {
    const loadedSelectedTestCases = selectedRowIds
      .map((id) => testCases.find((testCase) => testCase.id === id))
      .filter((testCase): testCase is TestCase => Boolean(testCase));

    if (isEmpty(loadedSelectedTestCases)) {
      return false;
    }

    return loadedSelectedTestCases.every((testCase) => isManualScenarioEmpty(testCase.manualScenario));
  }, [selectedRowIds, testCases]);

  const trackBulkOperation = useCallback(
    (elementName: TestCaseBulkOperationElementName) => {
      trackEvent(TEST_CASE_LIBRARY_EVENTS.clickBulkOperation(elementName));
    },
    [trackEvent],
  );

  const onClearSelection = useCallback(() => setSelectedRows([]), []);

  const handleSelectedRows = (rows: SelectedTestCaseRow[]) => setSelectedRows(rows);

  const folderTitle = useMemo(() => {
    const selectedFolder = folders.find((folder) => String(folder.id) === String(folderId));

    return selectedFolder?.name || formatMessage(COMMON_LOCALE_KEYS.ALL_TEST_CASES_TITLE);
  }, [folderId, folders, formatMessage]);

  const popoverItems: PopoverItem[] = canManageTestCases
    ? [
        {
          label: formatMessage(messages.duplicateToFolder),
          onClick: () => {
            trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.DUPLICATE);
            openBatchDuplicateToFolderModal({
              selectedTestCaseIds: selectedRowIds,
              count: selectedRowIds.length,
              onClearSelection,
            });
          },
        },
        {
          label: formatMessage(messages.changePriority),
          onClick: () => {
            trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.CHANGE_PRIORITY);
            dispatch(
              showModalAction({
                id: CHANGE_PRIORITY_MODAL_KEY,
                data: {
                  priority: 'unspecified',
                  selectedRowIds,
                  onClearSelection,
                },
              }),
            );
          },
        },
        {
          label: formatMessage(messages.editTags),
          onClick: () => {
            trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.EDIT_TAG);
            openBatchEditTagsModal({
              selectedTestCaseIds: selectedRowIds,
              count: selectedRowIds.length,
              onClearSelection,
            });
          },
        },
        {
          label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
          variant: 'destructive',
          onClick: () => {
            trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.DELETE);
            const folderDeltasMap = countBy(selectedRows, (row) => String(row.folderId));

            openBatchDeleteTestCasesModal({
              selectedTestCaseIds: selectedRowIds,
              folderDeltasMap,
              onClearSelection,
            });
          },
        },
      ]
    : [];

  const handleOpenAddToTestPlanModal = useCallback(() => {
    trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.ADD_TO_TEST_PLAN);
    openAddToTestPlanModal({ selectedTestCaseIds: selectedRowIds });
  }, [selectedRowIds, openAddToTestPlanModal, trackBulkOperation]);

  const handleOpenAddToLaunchModal = useCallback(() => {
    trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.ADD_TO_LAUNCH);
    openAddToLaunchModal({
      selectedTestCaseIds: selectedRowIds,
      onClearSelection,
      isUncoveredTestsCheckboxAvailable: false,
    });
  }, [openAddToLaunchModal, onClearSelection, selectedRowIds, trackBulkOperation]);

  const handleOpenMoveTestCaseModal = useCallback(() => {
    trackBulkOperation(TEST_CASE_BULK_OPERATION_ELEMENT_NAME.MOVE_TO_FOLDER);

    const sourceFolderDeltasMap = countBy(selectedRows, (row) => String(row.folderId));

    openMoveTestCaseModal({
      selectedTestCaseIds: selectedRowIds,
      sourceFolderDeltasMap,
      onClearSelection,
    });
  }, [trackBulkOperation, selectedRows, openMoveTestCaseModal, selectedRowIds, onClearSelection]);

  if (
    isEmpty(testCases) &&
    !isLoading &&
    !query?.testCasesSearchParams &&
    !query?.filterPriorities &&
    !query?.filterTags
  ) {
    return <FolderEmptyState folderTitle={folderTitle} />;
  }

  return (
    <>
      <div
        className={cx(
          'all-test-cases-page',
          isAnyRowSelected ? 'all-test-cases-page__with-panel' : '',
        )}
      >
        <TestCaseList
          testCases={testCases}
          isLoading={isLoading}
          selectedRowIds={selectedRowIds}
          selectedRows={selectedRows}
          folderTitle={folderTitle}
          instanceKey={instanceKey}
          handleSelectedRows={handleSelectedRows}
        />
      </div>
      {Boolean(testCasesPageData?.totalElements) && (
        <div className={cx('pagination', isAnyRowSelected ? 'pagination-with-panel' : '')}>
          <Pagination
            pageSize={pageSize}
            activePage={activePage}
            totalItems={testCasesPageData.totalElements}
            totalPages={totalPages}
            pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
            changePage={setPageNumber}
            changePageSize={setPageSize}
            captions={captions}
          />
        </div>
      )}
      {isAnyRowSelected && (
        <div className={cx('selection')}>
          <Selection selectedCount={selectedRowIds.length} onClearSelection={onClearSelection} />
          <div className={cx('selection-controls')}>
            <PopoverControl items={popoverItems} placement="bottom-end">
              <Button
                variant="ghost"
                adjustWidthOn="content"
                onClick={noop}
                className={cx('selection-controls__more-button')}
              >
                <MeatballMenuIcon />
              </Button>
            </PopoverControl>
            <Button variant="ghost" onClick={handleOpenMoveTestCaseModal}>
              {formatMessage(messages.moveToFolder)}
            </Button>
            {isAddToLaunchDisabled ? (
              <Tooltip
                wrapperClassName={cx('tooltip-wrapper')}
                placement="top"
                content={formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH_TOOLTIP_TEXT)}
              >
                <Button variant="ghost" disabled>
                  {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}
                </Button>
              </Tooltip>
            ) : (
              <Button variant="ghost" onClick={handleOpenAddToLaunchModal}>
                {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}
              </Button>
            )}
            {hasTestPlans ? (
              <Button onClick={handleOpenAddToTestPlanModal}>
                {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}
              </Button>
            ) : (
              <Tooltip
                wrapperClassName={cx('tooltip-wrapper')}
                placement="top"
                content={formatMessage(commonMessages.noTestPlanCreated)}
              >
                <Button disabled>{formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}</Button>
              </Tooltip>
            )}
          </div>
        </div>
      )}
    </>
  );
};
