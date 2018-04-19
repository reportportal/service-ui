import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fullscreen from 'react-full-screen';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { activeProjectSelector } from 'controllers/user';
import AddWidgetIcon from './img/add-solid-inline.svg';
import AddSharedWidgetIcon from './img/add-outline-inline.svg';
import EditIcon from './img/edit-inline.svg';
import CancelIcon from './img/cancel-inline.svg';
import FullscreenIcon from './img/full-screen-inline.svg';
import styles from './dashboardItemPage.scss';
import { WidgetsGrid } from './widgetsGrid';

const cx = classNames.bind(styles);

const messages = defineMessages({
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  addSharedWidget: {
    id: 'DashboardItemPage.addSharedWidget',
    defaultMessage: 'Add shared widget',
  },
  refreshWidget: {
    id: 'DashboardItemPage.refreshWidget',
    defaultMessage: 'Edit',
  },
  deleteWidget: {
    id: 'DashboardItemPage.deleteWidget',
    defaultMessage: 'Delete',
  },
  fullscreen: {
    id: 'DashboardItemPage.fullscreen',
    defaultMessage: 'Full screen',
  },
});

@connect((state) => ({
  url: `/api/v1/${activeProjectSelector(state)}/dashboard`,
}))
@injectIntl
export class DashboardItemPage extends Component {
  static propTypes = {
    url: PropTypes.string,
    intl: intlShape,
    match: PropTypes.object,
  };

  static defaultProps = {
    url: '',
    intl: {},
    match: {},
  };

  state = {
    isFull: false,
  };

  onChangeFullscreen = (isFull) => {
    this.setState({ isFull });
  };

  openFullscreen = (e) => {
    e.preventDefault();
    this.setState({ isFull: true });
  };

  closeFullscreen = () => {
    this.setState({ isFull: false });
  };

  render() {
    const { formatMessage } = this.props.intl;
    return (
      <div className={`${cx('dashboard-item')}`}>
        <div className={cx('buttons-container')}>
          <div className={cx('rp-nav-left')}>
            <GhostButton icon={AddWidgetIcon}>{formatMessage(messages.addNewWidget)}</GhostButton>
            <GhostButton icon={AddSharedWidgetIcon}>
              {formatMessage(messages.addSharedWidget)}
            </GhostButton>
          </div>
          <div className={cx('rp-nav-right')}>
            <GhostButton icon={EditIcon}>{formatMessage(messages.refreshWidget)}</GhostButton>
            <GhostButton icon={FullscreenIcon} onClick={this.openFullscreen}>
              {formatMessage(messages.fullscreen)}
            </GhostButton>
            <GhostButton icon={CancelIcon}>{formatMessage(messages.deleteWidget)}</GhostButton>
          </div>
        </div>

        <Fullscreen enabled={this.state.isFull} onChange={this.onChangeFullscreen}>
          <WidgetsGrid
            dashboardId={this.props.match.params.dashboardId}
            isFullscreen={this.state.isFull}
          />
          {this.state.isFull && (
            <i className={cx('icon-close')} onClick={this.closeFullscreen}>
              {Parser(CancelIcon)}
            </i>
          )}
        </Fullscreen>
      </div>
    );
  }
}
