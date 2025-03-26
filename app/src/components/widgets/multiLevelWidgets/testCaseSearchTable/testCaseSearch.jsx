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
import { activeDashboardIdSelector } from 'controllers/pages';
import {
  loadMoreSearchedItemsAction,
  searchedTestItemsSelector,
  testItemsSearchAction,
} from 'controllers/testItem';
import { TestCaseSearchControl } from './testCaseSearchControl';
import { TestCaseSearchContent } from './testCaseSearchContent';
import styles from './testCaseSearch.scss';

const TRACKING_EVENTS_TRIGGER_SOURCES = {
  creatingWidget: 'creating_widget',
  sorting: 'sorting',
  loadMore: 'load_more',
  status: 'test_execution_status',
};
const THROTTLING_SEARCH_TIME = 300;
const THROTTLING_STATUS_CHANGE_TIME = 1000;

const cx = classNames.bind(styles);
export const TestCaseSearch = ({ widget: { id: widgetId }, isDisplayedLaunches }) => {
  const dashboardId = useSelector(activeDashboardIdSelector);
  const searchDetails = useSelector(searchedTestItemsSelector);
  const targetWidgetSearch = searchDetails[widgetId] || {};
  const {
    searchCriteria = {},
    sortingDirection: initialDirection = SORTING_DESC,
    content = [],
    page = {},
    loading: fetchLoading = false,
    error = null,
  } = targetWidgetSearch;
  const [searchValue, setSearchValue] = useState(searchCriteria);
  const [sortingDirection, setSortingDirection] = useState(initialDirection);
  const [loading, setLoading] = useState(fetchLoading);
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
    setLoading(true);
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
    triggerSourceRef.current = TRACKING_EVENTS_TRIGGER_SOURCES.sorting;
    setSortingDirection(sortingDirection === SORTING_DESC ? SORTING_ASC : SORTING_DESC);
  };
  const handleLoadMore = () => {
    triggerSourceRef.current = TRACKING_EVENTS_TRIGGER_SOURCES.loadMore;
    trackEvent(WIDGETS_EVENTS.clickOnLoadMoreSearchItems(dashboardId, !!searchValue?.name?.value));
    dispatch(loadMoreSearchedItemsAction({ widgetId, trackPerformance }));
  };

  useEffect(() => {
    setLoading(fetchLoading);
  }, [fetchLoading]);

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
      <TestCaseSearchContent
        listView={isDisplayedLaunches}
        isEmptyState={isSearchValueEmpty}
        data={content}
        loading={loading}
        sortingDirection={sortingDirection}
        onChangeSorting={handleChangeSorting}
        onLoadMore={isLoadMoreAvailable ? handleLoadMore : null}
        error={error}
      />
    </div>
  );
};

TestCaseSearch.propTypes = {
  widget: PropTypes.object,
  isDisplayedLaunches: PropTypes.bool,
};
