import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import {
  eventsSelector,
  eventsPaginationSelector,
  fetchEventsAction,
  loadingSelector,
  NAMESPACE,
  DEFAULT_PAGE_SIZE,
} from 'controllers/administrate/events';
import { EventsGrid } from './eventsGrid';

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    url: URLS.events(activeProjectSelector(state)),
    events: eventsSelector(state),
    loading: loadingSelector(state),
  }),
  { fetchEventsAction },
)
@withPagination({
  paginationSelector: eventsPaginationSelector,
  namespace: NAMESPACE,
})
@injectIntl
export class ProjectEventsPage extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    fetchEventsAction: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    events: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGE_SIZE,
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    fetchEventsAction: () => {},
    loading: false,
    events: [],
  };
  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      events,
    } = this.props;
    return (
      <React.Fragment>
        <EventsGrid data={events} loading={loading} />
        {!!pageCount &&
          !loading && (
            <PaginationToolbar
              activePage={activePage}
              itemCount={itemCount}
              pageCount={pageCount}
              pageSize={pageSize}
              onChangePage={onChangePage}
              onChangePageSize={onChangePageSize}
            />
          )}
      </React.Fragment>
    );
  }
}
