import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { SIZE_KEY, withPagination } from 'controllers/pagination';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import {
  DEFAULT_PAGINATION,
  TABLE_VIEW,
  GRID_VIEW,
  projectsPaginationSelector,
  viewModeSelector,
  loadingSelector,
  projectsSelector,
  DEFAULT_SORT_COLUMN,
} from 'controllers/administrate/projects';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { NoItemMessage } from 'components/main/noItemMessage';

import { ProjectsPanelView } from './../projectsPanelView';
import { ProjectsGrid } from './../projectsGrid';
import { ProjectsToolbar } from './../projectsToolbar';

@connect((state) => ({
  viewMode: viewModeSelector(state),
  loading: loadingSelector(state),
  projects: projectsSelector(state),
}))
@withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
})
@withPagination({
  paginationSelector: projectsPaginationSelector,
})
@injectIntl
export class Projects extends Component {
  static propTypes = {
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    onChangePage: PropTypes.func.isRequired,
    onChangePageSize: PropTypes.func.isRequired,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
    intl: intlShape.isRequired,
    viewMode: PropTypes.string,
    loading: PropTypes.bool,
    projects: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    viewMode: GRID_VIEW,
    loading: false,
    projects: [],
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
  };

  render() {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      viewMode,
      loading,
      intl,
      projects,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
    } = this.props;

    return (
      <React.Fragment>
        <ProjectsToolbar
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
        />

        {viewMode === TABLE_VIEW ? (
          <ProjectsGrid
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            onChangeSorting={onChangeSorting}
          />
        ) : (
          <ProjectsPanelView />
        )}

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
        {!projects.length &&
          !loading && <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />}
      </React.Fragment>
    );
  }
}
