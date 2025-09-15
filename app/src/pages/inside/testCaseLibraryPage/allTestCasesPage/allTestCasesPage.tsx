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
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { isEmpty } from 'lodash';
import { Button, MeatballMenuIcon, Pagination, Selection } from '@reportportal/ui-kit';

import { TestCaseList } from 'pages/inside/testCaseLibraryPage/testCaseList';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/testCaseLibraryPage/testCaseList/mockData';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from 'pages/inside/testCaseLibraryPage/testCaseList/configUtils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { urlFolderIdSelector } from 'controllers/pages';
import { foldersSelector } from 'controllers/testCase';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { messages } from './messages';
import { FolderEmptyState } from '../emptyState/folder/folderEmptyState';
import { useAddTestCasesToTestPlanModal } from '../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';

import styles from './allTestCasesPage.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface AllTestCasesPageProps {
  testCases: TestCase[];
  loading: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const AllTestCasesPage = ({
  testCases,
  loading,
  searchValue,
  setSearchValue,
}: AllTestCasesPageProps) => {
  const { formatMessage } = useIntl();
  const [activePage, setActivePage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
  const [selectedRowIds, setSelectedRowIds] = useState<(number | string)[]>([]);
  const folderId = useSelector(urlFolderIdSelector);
  const folders = useSelector(foldersSelector);
  const isAnyRowSelected = !isEmpty(selectedRowIds);

  const folderTitle = useMemo(() => {
    const selectedFolder = folders.find((folder) => String(folder.id) === String(folderId));
    return selectedFolder?.name || formatMessage(messages.allTestCasesTitle);
  }, [folderId, folders, formatMessage]);

  const { openModal: openAddToTestPlanModal } = useAddTestCasesToTestPlanModal({
    selectedTestCases: selectedRowIds,
  });

  // Calculate pagination values
  const totalItems = testCases.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const popoverItems: PopoverItem[] = [
    {
      label: formatMessage(messages.duplicateToFolder),
    },
    {
      label: formatMessage(messages.changePriority),
    },
    {
      label: formatMessage(messages.editTags),
    },
    {
      label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      variant: 'destructive',
    },
  ];

  const handleSearchChange = useCallback(
    (targetSearchValue: string) => {
      setSearchValue(targetSearchValue);
      setActivePage(DEFAULT_CURRENT_PAGE);
    },
    [setSearchValue],
  );

  const changePageSize = (size: number) => {
    setPageSize(size);
    setActivePage(DEFAULT_CURRENT_PAGE);
  };

  if (isEmpty(testCases) && !loading) {
    return <FolderEmptyState folderTitle={folderTitle} />;
  }

  return (
    <>
      <div className={cx('all-test-cases-page')}>
        <TestCaseList
          testCases={testCases}
          loading={loading}
          currentPage={activePage}
          itemsPerPage={pageSize}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          selectedRowIds={selectedRowIds}
          handleSelectedRowIds={setSelectedRowIds}
          folderTitle={folderTitle}
        />
      </div>

      <div className={cx('sticky-wrapper')}>
        {totalItems > 0 && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={totalItems}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              changePage={setActivePage}
              changePageSize={changePageSize}
              captions={{
                items: formatMessage(messages.items),
                of: formatMessage(messages.of),
                page: formatMessage(messages.page),
                goTo: formatMessage(messages.goToPage),
                goAction: formatMessage(messages.go),
                perPage: formatMessage(messages.perPage),
              }}
            />
          </div>
        )}
        {isAnyRowSelected && (
          <div className={cx('selection')}>
            <Selection
              selectedCount={selectedRowIds.length}
              onClearSelection={() => setSelectedRowIds([])}
            />
            <div className={cx('selection-controls')}>
              <PopoverControl items={popoverItems} placement="bottom-end">
                <Button
                  variant="ghost"
                  adjustWidthOn="content"
                  onClick={() => {}}
                  className={cx('selection-controls__more-button')}
                >
                  <MeatballMenuIcon />
                </Button>
              </PopoverControl>
              <Button variant="ghost">{formatMessage(messages.moveToFolder)}</Button>
              <Button variant="ghost">{formatMessage(messages.addToLaunch)}</Button>
              <Button onClick={openAddToTestPlanModal}>
                {formatMessage(messages.addToTestPlan)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
