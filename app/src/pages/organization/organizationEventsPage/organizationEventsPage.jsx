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

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY } from 'controllers/pagination';
import {
  eventsSelector,
  eventsPaginationSelector,
  loadingSelector,
} from 'controllers/instance/events';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { ENTITY_CREATED_AT } from 'components/filterEntities/constants';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { SORTING_DESC, withSortingURL } from 'controllers/sorting';
import { EventsGrid } from './eventsGrid';
import { EventsToolbar } from './eventsToolbar';
import styles from './organizationEventsPage.scss';

const cx = classNames.bind(styles);

const OrganizationEventsPageWrapper = ({
  activePage = DEFAULT_PAGINATION[PAGE_KEY],
  itemCount = null,
  pageCount = null,
  pageSize = DEFAULT_PAGINATION[SIZE_KEY],
  sortingColumn = null,
  sortingDirection = null,
  onChangeSorting = () => {},
  onChangePage = () => {},
  onChangePageSize = () => {},
  loading = false,
  events = [],
}) => {
  const { trackEvent } = useTracking();
  const organizationId = useSelector(activeOrganizationIdSelector);

  useEffect(() => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.activityPage('activity', organizationId));
  }, [trackEvent]);

  return (
    <div className={cx('organization-events-page')}>
      <EventsToolbar />
      <EventsGrid
        data={events}
        loading={loading}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
      />
      {!!pageCount && !loading && (
        <PaginationToolbar
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      )}
    </div>
  );
};

OrganizationEventsPageWrapper.propTypes = {
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  pageSize: PropTypes.number,
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
  loading: PropTypes.bool,
  events: PropTypes.arrayOf(PropTypes.object),
};

OrganizationEventsPageWrapper.defaultProps = {
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
  itemCount: null,
  pageCount: null,
  pageSize: DEFAULT_PAGINATION[SIZE_KEY],
  sortingColumn: null,
  sortingDirection: null,
  onChangeSorting: () => {},
  onChangePage: () => {},
  onChangePageSize: () => {},
  loading: false,
  events: [],
};

const mapStateToProps = (state) => ({
  events: eventsSelector(state),
  loading: loadingSelector(state),
});

export const OrganizationEventsPage = connect(mapStateToProps)(
  withSortingURL({
    defaultFields: [ENTITY_CREATED_AT],
    defaultDirection: SORTING_DESC,
  })(
    withPagination({
      paginationSelector: eventsPaginationSelector,
    })(OrganizationEventsPageWrapper),
  ),
);
