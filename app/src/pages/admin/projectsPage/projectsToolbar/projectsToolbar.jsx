import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';

import { InputSearch } from 'components/inputs/inputSearch';
import { GhostButton } from 'components/buttons/ghostButton';

import {
  GRID_VIEW,
  TABLE_VIEW,
  startSetViewMode,
  viewModeSelector,
} from 'controllers/administrate/projects';

import ExportIcon from 'common/img/export-inline.svg';
import GridViewDashboardIcon from 'common/img/grid-inline.svg';
import TableViewDashboardIcon from 'common/img/table-inline.svg';

import { URLS } from 'common/urls';

import styles from './projectsToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchPlaceholder: {
    id: 'ProjectsToolbar.searchPlaceholder',
    defaultMessage: 'Search',
  },
});

@connect(
  (state) => ({
    viewMode: viewModeSelector(state),
  }),
  {
    setViewMode: startSetViewMode,
  },
)
@injectIntl
export class ProjectsToolbar extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    viewMode: PropTypes.string,
    setViewMode: PropTypes.func.isRequired,
  };

  static defaultProps = {
    viewMode: GRID_VIEW,
  };

  onExportProjects = () => {
    window.location.href = URLS.exportProjects();
  };

  render() {
    const { intl, viewMode, setViewMode } = this.props;

    return (
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
              <FormattedMessage id="ProjectsToolbar.export" defaultMessage="Export" />
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
    );
  }
}
