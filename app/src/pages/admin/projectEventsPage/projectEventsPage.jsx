import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import {
  eventsSelector,
  eventsPaginationSelector,
  loadingSelector,
} from 'controllers/administrate/events';
import { EventsGrid } from './eventsGrid';
import { EventsToolbar } from './eventsToolbar';

@connect((state) => ({
  projectId: projectIdSelector(state),
  url: URLS.events(activeProjectSelector(state)),
  events: eventsSelector(state),
  loading: loadingSelector(state),
}))
@withPagination({
  paginationSelector: eventsPaginationSelector,
})
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
    projectId: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    events: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
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
        <EventsToolbar />
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
