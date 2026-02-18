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
import { isEmpty, noop, compact, countBy } from 'es-toolkit/compat';
import { Button, MeatballMenuIcon, Pagination, Selection } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCaseList } from 'pages/inside/common/testCaseList';
import {
  ITEMS_PER_PAGE_OPTIONS,
  TEST_CASE_LIST_NAMESPACE,
  TestCasePageDefaultValues,
} from 'pages/inside/common/testCaseList/constants';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { showModalAction } from 'controllers/modal';
import { locationQuerySelector, payloadSelector, urlFolderIdSelector } from 'controllers/pages';
import { foldersSelector } from 'controllers/testCase';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { CHANGE_PRIORITY_MODAL_KEY } from './changePriorityModal';
import { messages } from './messages';
import { FolderEmptyState } from '../emptyState/folder/folderEmptyState';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { useBatchDuplicateToFolderModal } from './batchDuplicateToFolderModal';
import { useBatchDeleteTestCasesModal } from './batchDeleteTestCasesModal';
import { useMoveTestCaseModal } from '../moveTestCaseModal';
import { useAddToLaunchModal } from '../addToLaunchModal';

import styles from './allTestCasesPage.scss';

const cx = createClassnames(styles);

interface AllTestCasesPageProps {
  testCases: TestCase[];
  testCasesPageData: Page;
  isLoading: boolean;
  instanceKey: TMS_INSTANCE_KEY;
}

export interface SelectedTestCaseRow {
  id: number;
  folderId: number;
}

export const AllTestCasesPage = ({
  testCases,
  isLoading,
  instanceKey,
  testCasesPageData,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
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
  const isAnyRowSelected = !isEmpty(selectedRows);
  const selectedRowIds = useMemo(() => selectedRows.map((row) => row.id), [selectedRows]);
  const { openModal: openAddToTestPlanModal } = useAddTestCasesToTestPlanModal();
  const onClearSelection = () => setSelectedRows([]);
  const { openModal: openAddToLaunchModal } = useAddToLaunchModal({
    selectedTestCasesIds: selectedRowIds,
    onClearSelection,
    isUncoveredTestsCheckboxAvailable: false,
  });
  const { openModal: openBatchDuplicateToFolderModal } = useBatchDuplicateToFolderModal();
  const { openModal: openBatchDeleteTestCasesModal } = useBatchDeleteTestCasesModal();
  const { openModal: openMoveTestCaseModal } = useMoveTestCaseModal();
  const { canDeleteTestCase, canDuplicateTestCase, canEditTestCase } = useUserPermissions();

  const handleSelectedRows = (rows: SelectedTestCaseRow[]) => setSelectedRows(rows);

  const folderTitle = useMemo(() => {
    const selectedFolder = folders.find((folder) => String(folder.id) === String(folderId));
    return selectedFolder?.name || formatMessage(COMMON_LOCALE_KEYS.ALL_TEST_CASES_TITLE);
  }, [folderId, folders, formatMessage]);

  const popoverItems: PopoverItem[] = compact([
    canDuplicateTestCase && {
      label: formatMessage(messages.duplicateToFolder),
      onClick: () => {
        openBatchDuplicateToFolderModal({
          selectedTestCaseIds: selectedRowIds,
          count: selectedRowIds.length,
          onClearSelection,
        });
      },
    },
    canEditTestCase && {
      label: formatMessage(messages.changePriority),
      onClick: () => {
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
    canEditTestCase && {
      label: formatMessage(messages.editTags),
      onClick: noop,
    },
    canDeleteTestCase && {
      label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      variant: 'destructive',
      onClick: () => {
        const folderDeltasMap = countBy(selectedRows, (row) => String(row.folderId));

        openBatchDeleteTestCasesModal({
          selectedTestCaseIds: selectedRowIds,
          folderDeltasMap,
          onClearSelection,
        });
      },
    },
  ]);

  const handleOpenAddToTestPlanModal = useCallback(() => {
    openAddToTestPlanModal({ selectedTestCaseIds: selectedRowIds });
  }, [selectedRowIds, openAddToTestPlanModal]);

  const handleOpenAddToLaunchModal = useCallback(() => {
    openAddToLaunchModal();
  }, [openAddToLaunchModal]);

  const handleOpenMoveTestCaseModal = useCallback(() => {
    const sourceFolderDeltasMap = countBy(selectedRows, (row) => String(row.folderId));

    openMoveTestCaseModal({
      selectedTestCaseIds: selectedRowIds,
      sourceFolderDeltasMap,
      onClearSelection,
    });
  }, [selectedRowIds, selectedRows, openMoveTestCaseModal]);

  if (isEmpty(testCases) && !isLoading && !query?.testCasesSearchParams) {
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
          activePage={activePage}
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
            <Button variant="ghost" onClick={handleOpenAddToLaunchModal}>
              {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}
            </Button>
            <Button onClick={handleOpenAddToTestPlanModal}>
              {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
