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

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { BubblesLoader, Pagination, Table } from '@reportportal/ui-kit';

import { createClassnames, debounce } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { EmptyPageState } from 'pages/common/emptyPageState/emptyPageState';
import { AbsRelTime } from 'components/main/absRelTime';
import { SettingsLayout } from 'layouts/settingsLayout';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ITEMS_PER_PAGE_OPTIONS } from 'pages/inside/common/testCaseList/constants';
import { messages as testCaseListMessages } from 'pages/inside/common/testCaseList/messages';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';
import { projectKeySelector } from 'controllers/project';
import { payloadSelector, urlTestCaseSlugSelector } from 'controllers/pages';
import { testCaseDetailsSelector } from 'controllers/testCase';
import type { Page } from 'types/common';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { HistoryOfActionsHeader } from './historyOfActionsHeader';
import {
  HISTORY_OF_ACTIONS_NAMESPACE,
  HISTORY_SEARCH_DEBOUNCE_MS,
  HistoryOfActionsPageDefaultValues,
  TMS_TEST_CASE_OBJECT_TYPE,
} from './constants';
import { messages } from './messages';
import { useTestCaseActivityHistory } from './useTestCaseActivityHistory';
import { flattenActivityContent } from './utils';

import styles from './historyOfActions.scss';

const cx = createClassnames(styles);

const emptyPageData: Page = {
  number: 1,
  size: HistoryOfActionsPageDefaultValues.limit,
  totalElements: 0,
  totalPages: 0,
};

export const HistoryOfActions = () => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const payload = useSelector(payloadSelector);
  const testCaseId = useSelector(urlTestCaseSlugSelector);
  const projectKey = String(useSelector(projectKeySelector) ?? '');
  const testCaseDetails = useSelector(testCaseDetailsSelector);

  const [pageData, setPageData] = useState<Page>(emptyPageData);
  const [searchValue, setSearchValue] = useState('');
  const [appliedDetailsFilter, setAppliedDetailsFilter] = useState('');
  const debouncedSearchCancelRef = useRef<(() => void) | undefined>(undefined);

  const testCasePageRoute = payload?.testCasePageRoute ?? '';
  const baseUrl = testCaseId
    ? `/organizations/${organizationSlug}/projects/${projectSlug}/testLibrary/test-cases/${testCaseId}/historyOfActions`
    : `/organizations/${organizationSlug}/projects/${projectSlug}/testLibrary/${testCasePageRoute}`;

  const { setPageNumber, setPageSize, resetToFirstPage, captions, activePage, pageSize, offset } =
    useURLBoundPagination({
      pageData,
      defaultQueryParams: HistoryOfActionsPageDefaultValues,
      namespace: HISTORY_OF_ACTIONS_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl,
    });

  const applyDebouncedHistorySearch = useMemo(
    () =>
      debounce((raw: string) => {
        resetToFirstPage();
        setAppliedDetailsFilter(raw.trim());
      }, HISTORY_SEARCH_DEBOUNCE_MS),
    [resetToFirstPage],
  );

  const cancelPendingHistorySearch = useCallback(() => {
    debouncedSearchCancelRef.current?.();
    debouncedSearchCancelRef.current = undefined;
  }, []);

  const clearHistorySearchFields = useCallback(() => {
    setSearchValue('');
    setAppliedDetailsFilter('');
  }, []);

  const handleHistorySearchChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      const { value } = target;

      setSearchValue(value);
      cancelPendingHistorySearch();
      debouncedSearchCancelRef.current = applyDebouncedHistorySearch(value);
    },
    [applyDebouncedHistorySearch, cancelPendingHistorySearch],
  );

  const handleHistorySearchClear = useCallback(() => {
    cancelPendingHistorySearch();
    clearHistorySearchFields();
    resetToFirstPage();
  }, [cancelPendingHistorySearch, clearHistorySearchFields, resetToFirstPage]);

  const { content: fetchedContent, page: fetchedPage, isLoading: isFetching } =
    useTestCaseActivityHistory(projectKey, testCaseId, offset, pageSize, appliedDetailsFilter);

  useEffect(() => {
    cancelPendingHistorySearch();
    clearHistorySearchFields();
  }, [testCaseId, cancelPendingHistorySearch, clearHistorySearchFields]);

  const isSearchFieldLoading =
    isFetching || searchValue.trim() !== appliedDetailsFilter;

  useEffect(() => {
    if (fetchedPage) {
      setPageData(fetchedPage);
    }
  }, [fetchedPage]);

  const tableRows = useMemo(() => flattenActivityContent(fetchedContent), [fetchedContent]);

  const testCaseIdNumber = Number(testCaseId);
  const testCaseName = useMemo(() => {
    if (testCaseDetails?.id === testCaseIdNumber && testCaseDetails?.name) {
      return testCaseDetails.name;
    }
    const first = fetchedContent[0];

    if (first?.object_type === TMS_TEST_CASE_OBJECT_TYPE && first.object_name) {
      return first.object_name;
    }
    return testCaseId || '';
  }, [testCaseDetails, testCaseIdNumber, testCaseId, fetchedContent]);

  const currentHistory = useMemo(
    () =>
      tableRows.map(({ rowKey, item, historyEntry }) => {
        const {
          created_at: createdAt,
          subject_name: subjectName,
          subject_id: subjectId,
          event_name: eventName,
        } = item;
        const userIdNumeric = Number(subjectId);
        const hasNumericUserId = subjectId !== '' && !Number.isNaN(userIdNumeric);

        const oldRaw = historyEntry?.oldValue;
        const newRaw = historyEntry?.newValue;
        const oldDisplay = oldRaw !== undefined && oldRaw !== '' ? oldRaw : '-';
        const newDisplay = newRaw !== undefined && newRaw !== '' ? newRaw : '-';

        return {
          id: rowKey,
          time: {
            component: createdAt ? (
              <AbsRelTime
                startTime={createdAt}
                customClass={cx('history-of-actions__table-cell-time')}
              />
            ) : (
              <span>{formatMessage(messages.timeNotApplicable)}</span>
            ),
          },
          user: {
            component: (
              <div className={cx('history-of-actions__table-cell-user')}>
                {hasNumericUserId ? (
                  <UserAvatar
                    className={cx('history-of-actions__table-cell-user-avatar')}
                    userId={userIdNumeric}
                    thumbnail
                  />
                ) : (
                  <div className={cx('history-of-actions__table-cell-user-avatar--template')}>
                    {subjectName?.[0] ?? '?'}
                  </div>
                )}
                <span>{subjectName}</span>
              </div>
            ),
          },
          action: eventName,
          oldValue: {
            content: oldDisplay,
            component: (
              <div className={cx('history-of-actions__table-cell-value')}>{oldDisplay}</div>
            ),
          },
          newValue: {
            content: newDisplay,
            component: (
              <div className={cx('history-of-actions__table-cell-value')}>{newDisplay}</div>
            ),
          },
        };
      }),
    [tableRows, formatMessage],
  );

  const primaryColumn = {
    key: 'time',
    header: formatMessage(messages.time),
    width: 120,
    align: 'left' as const,
  };

  const fixedColumns = [
    {
      key: 'user',
      header: formatMessage(messages.user),
      width: 225,
      align: 'left' as const,
    },
    {
      key: 'action',
      header: formatMessage(messages.action),
      width: 160,
      align: 'left' as const,
    },
    {
      key: 'oldValue',
      header: formatMessage(messages.oldValue),
      width: 330,
      align: 'left' as const,
    },
    {
      key: 'newValue',
      header: formatMessage(messages.newValue),
      width: 330,
      align: 'left' as const,
    },
  ];

  const showPagination = Boolean(fetchedPage?.totalElements);
  const showEmptyState = !isFetching && tableRows.length === 0;

  return (
    <SettingsLayout>
      <div className={cx('history-of-actions-page')}>
        <div className={cx('history-of-actions-page__scroll')}>
          <ScrollWrapper resetRequired={false}>
            <div className={cx('history-of-actions')}>
              <HistoryOfActionsHeader
                testCaseName={testCaseName}
                className={cx('history-of-actions__header')}
                searchValue={searchValue}
                isSearchLoading={isSearchFieldLoading}
                onSearchChange={handleHistorySearchChange}
                onSearchClear={handleHistorySearchClear}
              />
              <div className={cx('history-of-actions__main-content')}>
                {isFetching && (
                  <div className={cx('history-of-actions__loader')}>
                    <BubblesLoader />
                  </div>
                )}
                {showEmptyState && (
                  <div className={cx('history-of-actions__empty-state')}>
                    <EmptyPageState
                      label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
                      description={formatMessage(testCaseListMessages.noResultsDescription)}
                      emptyIcon={NoResultsIcon as unknown as string}
                    />
                  </div>
                )}
                {!showEmptyState && !isFetching && (
                  <Table
                    data={currentHistory}
                    fixedColumns={fixedColumns}
                    primaryColumn={primaryColumn}
                    sortableColumns={[]}
                    className={cx('history-of-actions__table')}
                    rowClassName={cx('history-of-actions__table-row')}
                  />
                )}
              </div>
            </div>
          </ScrollWrapper>
        </div>
        {showPagination && fetchedPage && (
          <div className={cx('history-of-actions-page__pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={fetchedPage.totalElements}
              totalPages={fetchedPage.totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              changePage={setPageNumber}
              changePageSize={setPageSize}
              captions={captions}
            />
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};
