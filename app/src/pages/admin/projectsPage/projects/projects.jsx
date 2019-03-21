import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { SIZE_KEY, withPagination } from 'controllers/pagination';
import {
  DEFAULT_PAGINATION,
  TABLE_VIEW,
  GRID_VIEW,
  projectsPaginationSelector,
  viewModeSelector,
} from 'controllers/administrate/projects';

import { PaginationToolbar } from 'components/main/paginationToolbar';

import { ProjectsGrid } from './../projectsGrid';
import { ProjectsToolbar } from './../projectsToolbar';

@connect((state) => ({
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
    intl: intlShape.isRequired,
    viewMode: PropTypes.string,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
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
      viewMode,
    } = this.props;

    return (
      <React.Fragment>
        <ProjectsToolbar />

        {viewMode === TABLE_VIEW && <ProjectsGrid />}

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
