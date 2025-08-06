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

import { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button, Pagination, Selection } from '@reportportal/ui-kit';

import { TestCaseList } from 'pages/inside/testCaseLibraryPage/testCaseList';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/testCaseLibraryPage/testCaseList/mockData';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from 'pages/inside/testCaseLibraryPage/testCaseList/configUtils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { DotsMenuButton } from 'components/buttons/dotsMenuButton';
import { messages } from './messages';

import styles from './allTestCasesPage.scss';
import { DotsMenuItem } from './types';
import { noop } from '../constants';

const cx = classNames.bind(styles);

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

  // Calculate pagination values
  const totalItems = testCases.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const dotsMenuItems: DotsMenuItem[] = [
    {
      label: formatMessage(messages.duplicateToFolder),
      onClick: noop,
      title: formatMessage(messages.changePriority),
      value: 'duplicateToFolder',
    },
    {
      label: formatMessage(messages.changePriority),
      onClick: noop,
      title: formatMessage(messages.changePriority),
      value: 'changePriority',
    },
    {
      label: formatMessage(messages.editTags),
      onClick: noop,
      title: formatMessage(messages.editTags),
      value: 'editTags',
    },
    {
      label: formatMessage(messages.delete),
      onClick: noop,
      type: 'danger',
      title: formatMessage(messages.delete),
      value: 'delete',
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
        />
      </div>
      {totalItems > 0 && (
        <div
          className={cx('sticky-wrapper', {
            'sticky-wrapper--has-selected-items': selectedRowIds.length > 0,
          })}
        >
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
        </div>
      )}
      {selectedRowIds.length > 0 && (
        <div className={cx('sticky-wrapper')}>
          <div className={cx('selection')}>
            <Selection
              selectedCount={selectedRowIds.length}
              onClearSelection={() => setSelectedRowIds([])}
            />
            <div className={cx('selection-controls')}>
              <DotsMenuButton items={dotsMenuItems} />
              <Button variant="ghost">{formatMessage(messages.moveToFolder)}</Button>
              <Button variant="ghost">{formatMessage(messages.addToLaunch)}</Button>
              <Button>{formatMessage(messages.addToTestPlan)}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
