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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import {
  Button,
  RefreshIcon,
  Pagination,
  FilterOutlineIcon,
  FilterFilledIcon,
  ClearIcon,
} from '@reportportal/ui-kit';

import { projectNameSelector } from 'controllers/project';
import { SettingsLayout } from 'layouts/settingsLayout';
import { createClassnames, debounce } from 'common/utils';
import { SEARCH_DELAY } from 'common/constants/delayTime';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import {
  PROJECT_DASHBOARD_PAGE,
  urlOrganizationAndProjectSelector,
  locationSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';
import {
  manualLaunchContentSelector,
  isLoadingSelector,
  manualLaunchPageSelector,
  getManualLaunchesAction,
  MANUAL_LAUNCHES_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from 'controllers/manualLaunch';
import { SearchField } from 'components/fields/searchField';

import { messages } from './messages';
import { ManualLaunchesPageContent } from './manualLaunchesPageContent';
import { commonMessages } from '../testPlansPage/commonMessages';
import { ITEMS_PER_PAGE_OPTIONS } from './manualLaunchesList/contants';
import { useURLBoundPagination } from '../common/testCaseList/useURLBoundPagination';
import { PageHeaderWithBreadcrumbsAndActions } from '../common/pageHeaderWithBreadcrumbsAndActions';
import {
  ManualLaunchesFilterSidePanel,
  EMPTY_FILTER,
  filterSidePanelMessages,
  buildManualLaunchesBackendFilterParams,
  buildURLQueryFromFilters,
  parseFiltersFromURLQuery,
  MANUAL_LAUNCHES_FILTER_URL_KEYS,
  type ManualLaunchesFilterPayload,
} from './manualLaunchesFilterSidePanel';

import styles from './manualLaunchesPage.scss';

const cx = createClassnames(styles);

export const ManualLaunchesPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectName = useSelector(projectNameSelector);
  const content = useSelector(manualLaunchContentSelector);
  const pageInfo = useSelector(manualLaunchPageSelector);
  const isLoading = useSelector(isLoadingSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const location = useSelector(locationSelector);

  const appliedSearchQuery = location?.query?.searchQuery || '';
  const [searchValue, setSearchValue] = useState(appliedSearchQuery);
  const [isFilterSidePanelVisible, setIsFilterSidePanelVisible] = useState(false);
  const appliedFilters = useMemo<ManualLaunchesFilterPayload>(
    () => parseFiltersFromURLQuery(location?.query),
    [location?.query],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (!isEmpty(appliedFilters.statuses)) count += 1;
    if (appliedFilters.completion !== EMPTY_FILTER.completion) count += 1;
    if (appliedFilters.startTime !== null) count += 1;
    if (appliedFilters.testPlan !== null) count += 1;
    if (!isEmpty(appliedFilters.attributes)) count += 1;

    return count;
  }, [appliedFilters]);

  const hasActiveFilters = activeFiltersCount > 0;

  useEffect(() => {
    setSearchValue(appliedSearchQuery);
  }, [appliedSearchQuery]);

  const isSearchLoading = searchValue.trim() !== appliedSearchQuery || isLoading;

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value: string) => {
        const trimmed = value.trim();

        dispatch(
          updatePagePropertiesAction({
            searchQuery: trimmed,
            ...(trimmed !== appliedSearchQuery && { offset: 0 }),
          }),
        );
      }, SEARCH_DELAY),
    [dispatch, appliedSearchQuery],
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      debouncedUpdateSearch(value);
    },
    [debouncedUpdateSearch],
  );

  const { activePage, pageSize, setPageNumber, setPageSize, totalPages, captions, offset } =
    useURLBoundPagination({
      pageData: pageInfo,
      defaultQueryParams: defaultManualLaunchesQueryParams,
      namespace: MANUAL_LAUNCHES_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/manualLaunches`,
    });

  const handleFilterIconClick = useCallback(() => {
    setIsFilterSidePanelVisible(true);
  }, []);

  const handleCloseFilterSidePanel = useCallback(() => {
    setIsFilterSidePanelVisible(false);
  }, []);

  const handleApplyFilters = useCallback(
    (payload: ManualLaunchesFilterPayload) => {
      dispatch(
        updatePagePropertiesAction({
          ...buildURLQueryFromFilters(payload),
          offset: 0,
        }),
      );
    },
    [dispatch],
  );

  const handleClearAllFiltersFromToolbar = useCallback(() => {
    dispatch(
      updatePagePropertiesAction({
        ...buildURLQueryFromFilters(EMPTY_FILTER),
        offset: 0,
      }),
    );
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    const attributeParams = buildManualLaunchesBackendFilterParams(appliedFilters);

    dispatch(
      getManualLaunchesAction({
        offset,
        limit: pageSize,
        searchQuery: appliedSearchQuery || undefined,
        filterStatuses: appliedFilters.statuses,
        filterCompletion: location?.query?.[MANUAL_LAUNCHES_FILTER_URL_KEYS.COMPLETION] || undefined,
        filterStartTimeFrom: appliedFilters.startTime?.startDate
          ? appliedFilters.startTime.startDate.getTime()
          : undefined,
        filterEndTimeTo: appliedFilters.startTime?.endDate
          ? appliedFilters.startTime.endDate.getTime()
          : undefined,
        filterTestPlan: appliedFilters.testPlan || undefined,
        filterCompositeAttribute: attributeParams.filterCompositeAttribute,
      }),
    );
  }, [dispatch, offset, pageSize, appliedSearchQuery, appliedFilters, location?.query]);

  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.manualLaunchesTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
          {...((!isEmpty(content) || appliedSearchQuery || searchValue || isLoading || hasActiveFilters) && {
            actions: (
              <div className={cx('header-actions')}>
                <SearchField
                  isLoading={isSearchLoading}
                  searchValue={searchValue}
                  placeholder={formatMessage(messages.searchPlaceholder)}
                  setSearchValue={setSearchValue}
                  onFilterChange={handleFilterChange}
                />
                <div className={cx('filter-control', { active: hasActiveFilters })}>
                  <button
                    type="button"
                    className={cx('filter-icon')}
                    aria-label={formatMessage(filterSidePanelMessages.filterButton)}
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
                  {hasActiveFilters && (
                    <>
                      <span className={cx('filter-control-divider')} aria-hidden />
                      <button
                        type="button"
                        className={cx('filter-clear-button')}
                        aria-label={formatMessage(filterSidePanelMessages.clearAllFiltersAriaLabel)}
                        onClick={handleClearAllFiltersFromToolbar}
                      >
                        <ClearIcon />
                      </button>
                    </>
                  )}
                </div>
                <Button
                  variant="text"
                  data-automation-id="refreshPageButton"
                  icon={<RefreshIcon />}
                  disabled={isLoading}
                  onClick={handleRefresh}
                >
                  {formatMessage(commonMessages.refreshPage)}
                </Button>
              </div>
            ),
          })}
        />
        <div className={cx('content-wrapper')}>
          <ManualLaunchesPageContent
            fullLaunches={content}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            searchQuery={appliedSearchQuery}
          />
        </div>
        {Boolean(pageInfo?.totalElements) && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={pageInfo?.totalElements || 0}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              captions={captions}
              changePage={setPageNumber}
              changePageSize={setPageSize}
            />
          </div>
        )}
      </ScrollWrapper>
      <ManualLaunchesFilterSidePanel
        isVisible={isFilterSidePanelVisible}
        onClose={handleCloseFilterSidePanel}
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
      />
    </SettingsLayout>
  );
};
