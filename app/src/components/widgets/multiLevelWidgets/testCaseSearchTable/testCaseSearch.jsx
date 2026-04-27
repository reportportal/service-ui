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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import { WIDGETS_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting';
import { debounce } from 'common/utils';
import { activeDashboardIdSelector, projectIdSelector } from 'controllers/pages';
import { PROJECT_PLUGIN_PAGE } from 'controllers/pages/constants';
import { enabledPluginSelector } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import {
  loadMoreSearchedItemsAction,
  searchedTestItemsSelector,
  testItemsSearchAction,
} from 'controllers/testItem';
import { TestCaseSearchControl } from './testCaseSearchControl';
import { TestCaseSearchContent } from './testCaseSearchContent';
import { TestExecutionsPromoBanner } from './testExecutionsPromoBanner';
import { PremiumPromoModal } from './premiumPromoModal';
import styles from './testCaseSearch.scss';

const TRACKING_EVENTS_TRIGGER_SOURCES = {
  creatingWidget: 'creating_widget',
  sorting: 'sorting',
  loadMore: 'load_more',
  status: 'test_execution_status',
};
const THROTTLING_SEARCH_TIME = 300;
const THROTTLING_STATUS_CHANGE_TIME = 1000;

const PROMOTION_BANNER_SOURCE = 'promotion_banner';
const PREMIUM_POPUP_SOURCE = 'premium_features_popup';
const TEST_EXECUTION_PLUGIN_NAME = 'test-execution';
const TEST_EXECUTION_PLUGIN_PAGE = 'testExecution';

const cx = classNames.bind(styles);
export const TestCaseSearch = ({ widget: { id: widgetId }, isDisplayedLaunches }) => {
  const dashboardId = useSelector(activeDashboardIdSelector);
  const projectId = useSelector(projectIdSelector);
  const isTestExecutionPluginEnabled = useSelector((state) =>
    enabledPluginSelector(state, TEST_EXECUTION_PLUGIN_NAME),
  );
  const searchDetails = useSelector(searchedTestItemsSelector);
  const targetWidgetSearch = searchDetails[widgetId] || {};
  const {
    searchCriteria = {},
    sortingDirection: initialDirection = SORTING_DESC,
    content = [],
    page = {},
    loading: fetchLoading = false,
    loadingMore = false,
    error = null,
  } = targetWidgetSearch;
  const [searchValue, setSearchValue] = useState(searchCriteria);
  const [sortingDirection, setSortingDirection] = useState(initialDirection);
  const [isTableLoading, setIsTableLoading] = useState(fetchLoading);
  const [throttling, setThrottling] = useState(THROTTLING_SEARCH_TIME);
  const triggerSourceRef = useRef(null);

  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const isSearchValueEmpty = !Object.keys(searchValue).length;
  const isLoadMoreAvailable = page?.hasNext;

  const trackPerformance = useCallback(
    (responseTime) => {
      const selectedStatuses = searchValue?.status?.value && searchValue.status.value.split(',');
      trackEvent(
        WIDGETS_EVENTS.onLoadCompletion(
          dashboardId,
          responseTime,
          triggerSourceRef.current,
          !!searchValue?.name?.value,
          selectedStatuses,
        ),
      );
    },
    [searchValue],
  );

  const handleSearch = (entity) => {
    setThrottling(THROTTLING_SEARCH_TIME);
    setIsTableLoading(true);
    triggerSourceRef.current = TRACKING_EVENTS_TRIGGER_SOURCES.creatingWidget;
    setSearchValue(entity);
  };
  const handleClear = () => {
    setSearchValue({});
  };
  const handleStatusChange = (entity) => {
    const value = entity.status.value;
    const selectedStatuses = value.split(',');
    triggerSourceRef.current = TRACKING_EVENTS_TRIGGER_SOURCES.status;
    setSearchValue(entity);
    setThrottling(
      !value || selectedStatuses.length === 5
        ? THROTTLING_SEARCH_TIME
        : THROTTLING_STATUS_CHANGE_TIME,
    );
  };
  const handleChangeSorting = () => {
    setThrottling(THROTTLING_SEARCH_TIME);
    triggerSourceRef.current = TRACKING_EVENTS_TRIGGER_SOURCES.sorting;
    setSortingDirection(sortingDirection === SORTING_DESC ? SORTING_ASC : SORTING_DESC);
  };
  const handleLoadMore = () => {
    triggerSourceRef.current = TRACKING_EVENTS_TRIGGER_SOURCES.loadMore;
    trackEvent(WIDGETS_EVENTS.clickOnLoadMoreSearchItems(dashboardId, !!searchValue?.name?.value));
    dispatch(loadMoreSearchedItemsAction({ widgetId, trackPerformance, isDisplayedLaunches }));
  };

  const handleDocumentationClick = () => {
    trackEvent(WIDGETS_EVENTS.onTcsPromoDocumentationClick(dashboardId, PROMOTION_BANNER_SOURCE));
  };
  const handleLoadMoreMessageDocumentationClick = () => {
    trackEvent(
      WIDGETS_EVENTS.onSearchWidgetDocumentLinkClick(dashboardId, 'promotion_load_more_message'),
    );
  };

  const handleOpenNewSearch = () => {
    if (isTestExecutionPluginEnabled) {
      trackEvent(WIDGETS_EVENTS.onTcsPromoOpenNewSearchNavigate(dashboardId, PROMOTION_BANNER_SOURCE));
      dispatch({
        type: PROJECT_PLUGIN_PAGE,
        payload: { projectId, pluginPage: TEST_EXECUTION_PLUGIN_PAGE },
      });
    } else {
      trackEvent(WIDGETS_EVENTS.onTcsPromoOpenNewSearchNavigate(dashboardId, PROMOTION_BANNER_SOURCE));
      dispatch(
        showModalAction({
          component: (
            <PremiumPromoModal
              onExplorePlans={() =>
                trackEvent(
                  WIDGETS_EVENTS.onTcsPremiumExplorePlansClick(dashboardId, PREMIUM_POPUP_SOURCE),
                )
              }
              onContactUs={() =>
                trackEvent(
                  WIDGETS_EVENTS.onTcsPremiumContactUsClick(dashboardId, PREMIUM_POPUP_SOURCE),
                )
              }
              onNotNow={() =>
                trackEvent(
                  WIDGETS_EVENTS.onTcsPremiumNotNowClick(dashboardId, PREMIUM_POPUP_SOURCE),
                )
              }
            />
          ),
        }),
      );
    }
  };

  useEffect(() => {
    setIsTableLoading(fetchLoading);
  }, [fetchLoading]);

  useEffect(() => {
    trackEvent(WIDGETS_EVENTS.onTcsPromoBannerImpression(dashboardId, PROMOTION_BANNER_SOURCE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSearchValueEmpty) return () => {};
    const debouncedDispatch = debounce(() => {
      dispatch(
        testItemsSearchAction({
          searchParams: { searchCriteria: searchValue, sortingDirection },
          widgetId,
          trackPerformance,
        }),
      );
    }, throttling);

    return debouncedDispatch();
  }, [searchValue, sortingDirection, dispatch]);

  return (
    <div className={cx('test-case-search-container')}>
      <TestCaseSearchControl
        filter={searchValue}
        onSearchChange={handleSearch}
        onClear={handleClear}
        onStatusChange={handleStatusChange}
      />
      <TestExecutionsPromoBanner
        onOpenNewSearch={handleOpenNewSearch}
        onDocumentationClick={handleDocumentationClick}
      />
      <TestCaseSearchContent
        listView={isDisplayedLaunches}
        isEmptyState={isSearchValueEmpty}
        data={content}
        isTableLoading={isTableLoading}
        isLoadingMore={loadingMore}
        sortingDirection={sortingDirection}
        onChangeSorting={handleChangeSorting}
        onLoadMore={isLoadMoreAvailable ? handleLoadMore : null}
        onLoadMoreMessageDocumentationClick={handleLoadMoreMessageDocumentationClick}
        error={error}
      />
    </div>
  );
};

TestCaseSearch.propTypes = {
  widget: PropTypes.object,
  isDisplayedLaunches: PropTypes.bool,
};
