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
import { useDispatch, useSelector, useStore } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { Button, FilterFilledIcon, FilterOutlineIcon, RefreshIcon } from '@reportportal/ui-kit';

import { createClassnames, debounce } from 'common/utils';
import { SEARCH_DELAY } from 'common/constants/delayTime';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SearchField } from 'components/fields/searchField';
import {
  MANUAL_LAUNCHES_PAGE,
  locationSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import {
  getManualLaunchAction,
  getManualLaunchFoldersAction,
  getManualLaunchTestCaseExecutionsAction,
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
  isLoadingManualLaunchFoldersSelector,
  isLoadingManualLaunchTestCaseExecutionsSelector,
  isLoadingManualLaunchFilteredFoldersSelector,
  defaultManualLaunchesQueryParams,
  getManualLaunchDetailsFetchParams,
  MANUAL_LAUNCH_TO_RUN_STATUS_QUERY_VALUE,
} from 'controllers/manualLaunch';
import {
  showNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
} from 'controllers/notification';
import {
  useProjectDetails,
  useManualLaunchId,
  useManualLaunchById,
  useActiveManualLaunchLoading,
} from 'hooks/useTypedSelector';
import {
  FilterSidePanel,
  type FilterApplyPayload,
} from 'pages/inside/common/testCaseList/filterSidePanel';
import {
  parsePrioritiesFromQuery,
  parseTagsFromQuery,
  toBackendPriority,
} from 'pages/inside/common/testCaseList/filterSidePanel/utils';
import { messages as testCaseListMessages } from 'pages/inside/common/testCaseList/messages';
import { ExecutionStatus } from 'types/testCase';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PageLoader } from '../../testPlansPage/pageLoader';
import { EmptyManualLaunch } from './emptyState';
import { ManualLaunchFolders } from './manualLaunchFolders';
import { messages } from './messages';
import { messages as manualLaunchesMessages } from '../messages';
import { commonMessages } from '../../testPlansPage/commonMessages';

import styles from './manualLaunchDetailsPage.scss';

const cx = createClassnames(styles);

export const ManualLaunchDetailsPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const store = useStore();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const launchId = useManualLaunchId();
  const launch = useManualLaunchById(launchId);
  const isLoading = useActiveManualLaunchLoading();
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const isLoadingFolders = useSelector(isLoadingManualLaunchFoldersSelector);
  const isLoadingExecutions = useSelector(isLoadingManualLaunchTestCaseExecutionsSelector);
  const isLoadingFilteredFolders = useSelector(isLoadingManualLaunchFilteredFoldersSelector);

  const {
    searchQuery: querySearch,
    filterPriorities: queryFilterPriorities,
    filterTags: queryFilterTags,
    statusFilter: queryStatusFilter,
  } = useSelector(locationSelector)?.query ?? {};

  const appliedSearchQuery = querySearch || '';
  const [searchValue, setSearchValue] = useState(appliedSearchQuery);
  const [isFilterSidePanelVisible, setIsFilterSidePanelVisible] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(() =>
    parsePrioritiesFromQuery(queryFilterPriorities),
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    parseTagsFromQuery(queryFilterTags),
  );

  useEffect(() => {
    setSelectedPriorities(parsePrioritiesFromQuery(queryFilterPriorities));
    setSelectedTags(parseTagsFromQuery(queryFilterTags));
  }, [queryFilterPriorities, queryFilterTags]);

  const selectedToRunOnly =
    queryStatusFilter === MANUAL_LAUNCH_TO_RUN_STATUS_QUERY_VALUE;

  const activeFiltersCount = useMemo(() => {
    const priorities = parsePrioritiesFromQuery(queryFilterPriorities);
    const tags = parseTagsFromQuery(queryFilterTags);
    const toRun = queryStatusFilter === MANUAL_LAUNCH_TO_RUN_STATUS_QUERY_VALUE;

    return (isEmpty(priorities) ? 0 : 1) + (isEmpty(tags) ? 0 : 1) + (toRun ? 1 : 0);
  }, [queryFilterPriorities, queryFilterTags, queryStatusFilter]);

  const hasActiveFilters = activeFiltersCount > 0;

  const isSearchLoading =
    searchValue !== appliedSearchQuery ||
    isLoadingExecutions ||
    isLoadingFilteredFolders;

  const handleFilterChange = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    debounce((value: string) => {
      dispatch(
        updatePagePropertiesAction({
          searchQuery: value,
          ...defaultManualLaunchesQueryParams,
        }),
      );
    }, SEARCH_DELAY),
    [dispatch],
  );

  useEffect(() => {
    if (!isLoading && isEmpty(launch) && launchId) {
      dispatch(
        showNotification({
          type: NOTIFICATION_TYPES.WARNING,
          message: formatMessage(messages.manualLaunchNotFoundRedirect),
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );

      dispatch({
        type: MANUAL_LAUNCHES_PAGE,
        payload: { organizationSlug, projectSlug },
      });
    }
  }, [isLoading, launch, launchId, dispatch, organizationSlug, projectSlug, formatMessage]);

  const handleRefresh = useCallback(() => {
    const params = getManualLaunchDetailsFetchParams(store.getState());
    if (!params.launchId) {
      return;
    }

    dispatch(getManualLaunchAction({ launchId: params.launchId }));
    dispatch(
      getManualLaunchFoldersAction({
        launchId: params.launchId,
        offset: 0,
        limit: 100,
        ...(params.filterPriorities && { filterPriorities: params.filterPriorities }),
        ...(params.filterTags && { filterTags: params.filterTags }),
      }),
    );
    dispatch(
      getManualLaunchTestCaseExecutionsAction({
        launchId: params.launchId,
        ...(params.folderId && { folderId: params.folderId }),
        offset: params.offset,
        limit: params.limit,
        ...(params.searchQuery && { searchQuery: params.searchQuery }),
        ...(params.filterPriorities && { filterPriorities: params.filterPriorities }),
        ...(params.filterTags && { filterTags: params.filterTags }),
        ...(params.statusFilter && { statusFilter: params.statusFilter }),
      }),
    );
  }, [dispatch, store]);

  const handleCloseFilterSidePanel = () => {
    setIsFilterSidePanelVisible(false);
  };

  const handleFilterIconClick = () => {
    setIsFilterSidePanelVisible(true);
  };

  const handleApplyFilters = ({ priorities, tags, toRunOnly }: FilterApplyPayload) => {
    const filterPriorities = isEmpty(priorities) ? undefined : toBackendPriority(priorities);
    const filterTags = isEmpty(tags) ? undefined : tags.join(',');
    const statusFilter = toRunOnly ? ExecutionStatus.TO_RUN : undefined;

    dispatch(
      updatePagePropertiesAction({
        filterPriorities,
        filterTags,
        statusFilter,
        ...defaultManualLaunchesQueryParams,
      }),
    );
  };

  const breadcrumbDescriptors = [
    {
      id: 'manualLaunches',
      title: formatMessage(manualLaunchesMessages.manualLaunchesTitle),
      link: {
        type: MANUAL_LAUNCHES_PAGE,
        payload: { organizationSlug, projectSlug },
      },
    },
    { id: 'manualLaunch', title: launch?.name || '' },
  ];

  const renderActions = () => (
    <div className={cx('manual-launch-details-page__header-actions')}>
      <SearchField
        isLoading={isSearchLoading}
        searchValue={searchValue}
        placeholder={formatMessage(messages.searchPlaceholder)}
        setSearchValue={setSearchValue}
        onFilterChange={handleFilterChange}
      />
      <button
        type="button"
        className={cx('manual-launch-details-page__filter-icon', { active: hasActiveFilters })}
        aria-label={formatMessage(testCaseListMessages.filterButton)}
        onClick={handleFilterIconClick}
      >
        {hasActiveFilters ? (
          <>
            <FilterFilledIcon />
            <span className={cx('manual-launch-details-page__filter-count')}>{activeFiltersCount}</span>
          </>
        ) : (
          <FilterOutlineIcon />
        )}
      </button>
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
  );

  if (isLoading) {
    return (
      <SettingsLayout>
        <PageLoader />
      </SettingsLayout>
    );
  }

  const hasActiveSearchOrFilters =
    !!appliedSearchQuery ||
    !!queryFilterPriorities ||
    !!queryFilterTags ||
    queryStatusFilter === MANUAL_LAUNCH_TO_RUN_STATUS_QUERY_VALUE;

  const renderContent = () => {
    const hasData = !isEmpty(folders) || !isEmpty(executions);
    const isLoadingFoldersView = isLoadingFolders || isLoadingExecutions;

    if (hasData || isLoadingFoldersView || hasActiveSearchOrFilters) {
      return <ManualLaunchFolders />;
    }

    if (!launch?.statistics?.executions?.total) {
      return <EmptyManualLaunch />;
    }

    return null;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('manual-launch-details-page')}>
          <PageHeaderWithBreadcrumbsAndActions
            title={launch?.name || ''}
            breadcrumbDescriptors={breadcrumbDescriptors}
            actions={renderActions()}
          />
          <div className={cx('manual-launch-details-page__content')}>{renderContent()}</div>
          <FilterSidePanel
            isVisible={isFilterSidePanelVisible}
            onClose={handleCloseFilterSidePanel}
            selectedPriorities={selectedPriorities}
            selectedTags={selectedTags}
            selectedToRunOnly={selectedToRunOnly}
            showToRunOnly
            onPrioritiesChange={setSelectedPriorities}
            onTagsChange={setSelectedTags}
            onApply={handleApplyFilters}
          />
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
