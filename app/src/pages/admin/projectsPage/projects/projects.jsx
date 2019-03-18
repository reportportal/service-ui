import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { SIZE_KEY, withPagination } from 'controllers/pagination';
import {
  DEFAULT_PAGINATION,
  TABLE_VIEW,
  GRID_VIEW,
  loadingSelector,
  projectsPaginationSelector,
  projectsSelector,
  viewModeSelector,
} from 'controllers/administrate/projects';

import { PaginationToolbar } from 'components/main/paginationToolbar';

import { ProjectsGrid } from './../projectsGrid';
import { ProjectsToolbar } from './../projectsToolbar';

@connect((state) => ({
  projects: projectsSelector(state),
  loading: loadingSelector(state),
  viewMode: viewModeSelector(state),
}))
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
    loading: PropTypes.bool,
    projects: PropTypes.arrayOf(PropTypes.object),
    intl: intlShape.isRequired,
    viewMode: PropTypes.string,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    loading: false,
    projects: [],
    viewMode: GRID_VIEW,
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
      projects,
      viewMode,
    } = this.props;

    return (
      <React.Fragment>
        <ProjectsToolbar />

        {viewMode === TABLE_VIEW && <ProjectsGrid data={projects} loading={loading} />}

        <PaginationToolbar
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      </React.Fragment>
    );
  }
}
