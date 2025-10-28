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

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isEmpty, noop } from 'es-toolkit/compat';
import { Button, MeatballMenuIcon, Pagination, Selection } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCaseList } from 'pages/inside/common/testCaseList';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import {
  ITEMS_PER_PAGE_OPTIONS,
  TestCasePageDefaultValues,
} from 'pages/inside/common/testCaseList/constants';
import { DEFAULT_CURRENT_PAGE } from 'pages/inside/common/testCaseList/configUtils';
import { TestCase, Page } from 'pages/inside/testCaseLibraryPage/types';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { showModalAction } from 'controllers/modal';
import { urlFolderIdSelector } from 'controllers/pages';
import {
  foldersSelector,
  getAllTestCasesAction,
  getTestCaseByFolderIdAction,
} from 'controllers/testCase';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { usePagination } from 'hooks/usePagination';

import { CHANGE_PRIORITY_MODAL_KEY } from './changePriorityModal';
import { messages } from './messages';
import { FolderEmptyState } from '../emptyState/folder/folderEmptyState';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';

import styles from './allTestCasesPage.scss';

const cx = createClassnames(styles);

interface AllTestCasesPageProps {
  testCases: TestCase[];
  testCasesPageData: Page;
  loading: boolean;
  searchValue: string;
  instanceKey: INSTANCE_KEYS;
  setSearchValue: (value: string) => void;
}

const FIRST_PAGE_NUMBER = 1;

export const AllTestCasesPage = ({
  testCases,
  loading,
  searchValue,
  setSearchValue,
  instanceKey,
  testCasesPageData,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
  const { captions, activePage, pageSize, totalPages, setActivePage, changePageSize } =
    usePagination({
      totalItems: testCasesPageData?.totalElements,
    });
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const folderId = useSelector(urlFolderIdSelector);
  const folders = useSelector(foldersSelector);
  const dispatch = useDispatch();
  const isAnyRowSelected = !isEmpty(selectedRowIds);

  useEffect(() => {
    setActivePage(FIRST_PAGE_NUMBER);
  }, [folderId, setActivePage]);

  const folderTitle = useMemo(() => {
    const selectedFolder = folders.find((folder) => String(folder.id) === String(folderId));
    return selectedFolder?.name || formatMessage(COMMON_LOCALE_KEYS.ALL_TEST_CASES_TITLE);
  }, [folderId, folders, formatMessage]);

  const { openModal: openAddToTestPlanModal } = useAddTestCasesToTestPlanModal();

  const popoverItems: PopoverItem[] = [
    {
      label: formatMessage(messages.duplicateToFolder),
      onClick: noop,
    },
    {
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
    {
      label: formatMessage(messages.editTags),
      onClick: noop,
    },
    {
      label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      variant: 'destructive',
      onClick: noop,
    },
  ];

  const handleOpenAddToTestPlanModal = useCallback(() => {
    openAddToTestPlanModal({ selectedTestCaseIds: selectedRowIds });
  }, [selectedRowIds, openAddToTestPlanModal]);

  const handleSearchChange = useCallback(
    (targetSearchValue: string) => {
      setSearchValue(targetSearchValue);
      setActivePage(DEFAULT_CURRENT_PAGE);
    },
    [setSearchValue, setActivePage],
  );

  if (isEmpty(testCases) && !loading) {
    return <FolderEmptyState folderTitle={folderTitle} />;
  }

  const onClearSelection = () => setSelectedRowIds([]);

  const setTestCasesPage = (page: number): void => {
    const params = {
      limit: pageSize,
      offset: (page - 1) * testCasesPageData.size,
    };

    if (folderId) {
      dispatch(
        getTestCaseByFolderIdAction({
          folderId: Number(folderId),
          ...params,
        }),
      );
    } else {
      dispatch(getAllTestCasesAction(params));
    }

    setActivePage(page);
  };

  const setTestCasesPageSize = (pageSize: number): void => {
    const params = {
      limit: pageSize,
      offset: TestCasePageDefaultValues.offset,
    };

    if (folderId) {
      dispatch(
        getTestCaseByFolderIdAction({
          folderId: Number(folderId),
          ...params,
        }),
      );
    } else {
      dispatch(getAllTestCasesAction(params));
    }

    changePageSize(pageSize);
  };

  return (
    <>
      <div className={cx('all-test-cases-page')}>
        <TestCaseList
          testCases={testCases}
          loading={loading}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          selectedRowIds={selectedRowIds}
          handleSelectedRowIds={setSelectedRowIds}
          folderTitle={folderTitle}
          instanceKey={instanceKey}
        />
      </div>

      <div className={cx('sticky-wrapper')}>
        {Boolean(testCasesPageData?.totalElements) && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={testCasesPageData.totalElements}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              changePage={setTestCasesPage}
              changePageSize={setTestCasesPageSize}
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
              <Button variant="ghost">{formatMessage(messages.moveToFolder)}</Button>
              <Button variant="ghost">{formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}</Button>
              <Button onClick={handleOpenAddToTestPlanModal}>
                {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
