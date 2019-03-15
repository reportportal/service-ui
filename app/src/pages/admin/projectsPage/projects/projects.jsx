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
  toggleViewAction,
  viewTypeSelector,
} from 'controllers/administrate/projects';

import { GhostButton } from 'components/buttons/ghostButton';
import { InputSearch } from 'components/inputs/inputSearch';
import { PaginationToolbar } from 'components/main/paginationToolbar';

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
    viewType: viewTypeSelector(state),
  }),
  {
    toggleView: toggleViewAction,
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
    loading: PropTypes.bool,
    projects: PropTypes.arrayOf(PropTypes.object),
    intl: intlShape.isRequired,
    toggleView: PropTypes.func.isRequired,
    viewType: PropTypes.string,
  };

  static defaultProps = {
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    loading: false,
    projects: [],
    viewType: TABLE_VIEW,
  };

  render() {
    const {
      intl,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      loading,
      projects,
      toggleView,
      viewType,
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
              <GhostButton icon={ExportIcon} mobileDisabled>
                <FormattedMessage id="Projects.export" defaultMessage="Export" />
              </GhostButton>
            </div>
            <div
              className={cx('toolbar-button', { 'toolbar-active-button': viewType === GRID_VIEW })}
            >
              <GhostButton icon={GridViewDashboardIcon} onClick={() => toggleView(GRID_VIEW)} />
            </div>
            <div
              className={cx('toolbar-button', { 'toolbar-active-button': viewType === TABLE_VIEW })}
            >
              <GhostButton icon={TableViewDashboardIcon} onClick={() => toggleView(TABLE_VIEW)} />
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
        />
      </React.Fragment>
    );
  }
}
