import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';

import { SIZE_KEY, withPagination } from 'controllers/pagination';
import {
  DEFAULT_PAGINATION,
  TABLE_VIEW,
  GRID_VIEW,
  loadingSelector,
  projectsPaginationSelector,
  projectsSelector,
  startSetViewMode,
  viewModeSelector,
} from 'controllers/administrate/projects';

import { GhostButton } from 'components/buttons/ghostButton';
import { InputSearch } from 'components/inputs/inputSearch';
import { PaginationToolbar } from 'components/main/paginationToolbar';

import { URLS } from 'common/urls';

import GridViewDashboardIcon from 'common/img/grid-inline.svg';
import TableViewDashboardIcon from 'common/img/table-inline.svg';
import ExportIcon from 'common/img/export-inline.svg';

import styles from './projects.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  searchPlaceholder: {
    id: 'Projects.searchPlaceholder',
    defaultMessage: 'Search',
  },
});

@connect(
  (state) => ({
    projects: projectsSelector(state),
    loading: loadingSelector(state),
    viewMode: viewModeSelector(state),
  }),
  {
    setViewMode: startSetViewMode,
  },
)
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
    setViewMode: PropTypes.func.isRequired,
    viewMode: PropTypes.string,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    loading: false,
    projects: [],
    viewMode: TABLE_VIEW,
  };

  onExportProjects = () => {
    window.location.href = URLS.exportProjects();
  };

  render() {
    const {
      intl,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      loading,
      projects,
      setViewMode,
      viewMode,
    } = this.props;

    return (
      <React.Fragment>
        <div className={cx('toolbar')}>
          <div className={cx('search')}>
            <InputSearch
              maxLength="128"
              placeholder={intl.formatMessage(messages.searchPlaceholder)}
            />
          </div>
          <div className={cx('buttons')}>
            <div className={cx('toolbar-button')}>
              <GhostButton icon={ExportIcon} mobileDisabled onClick={this.onExportProjects}>
                <FormattedMessage id="Projects.export" defaultMessage="Export" />
              </GhostButton>
            </div>
            <div
              className={cx('toolbar-button', { 'toolbar-active-button': viewMode === GRID_VIEW })}
            >
              <GhostButton icon={GridViewDashboardIcon} onClick={() => setViewMode(GRID_VIEW)} />
            </div>
            <div
              className={cx('toolbar-button', { 'toolbar-active-button': viewMode === TABLE_VIEW })}
            >
              <GhostButton icon={TableViewDashboardIcon} onClick={() => setViewMode(TABLE_VIEW)} />
            </div>
          </div>
        </div>
        {!loading &&
          projects.map(({ projectId, projectName }) => (
            <div key={projectId}>
              {projectId}: {projectName}
            </div>
          ))}

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
