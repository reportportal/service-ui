import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { CUSTOMER } from 'common/constants/projectRoles';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { canDeleteLaunch, canForceFinishLaunch, canMoveToDebug } from 'common/utils/permissions';
import { URLS } from 'common/urls';
import {
  activeProjectRoleSelector,
  userIdSelector,
  userAccountRoleSelector,
  activeProjectSelector,
} from 'controllers/user';
import { HamburgerMenuItem } from './hamburgerMenuItem';
import styles from './hamburger.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  toDebug: {
    id: 'Hamburger.toDebug',
    defaultMessage: 'Move to debug',
  },
  toAllLaunches: {
    id: 'Hamburger.toAllLaunches',
    defaultMessage: 'Move to all launches',
  },
  forceFinish: {
    id: 'Hamburger.forceFinish',
    defaultMessage: 'Force Finish',
  },
  analysis: {
    id: 'Hamburger.analysis',
    defaultMessage: 'Analysis',
  },
  delete: {
    id: 'Hamburger.delete',
    defaultMessage: 'Delete',
  },
  launchFinished: {
    id: 'Hamburger.launchFinished',
    defaultMessage: 'Launch is finished',
  },
  noPermissions: {
    id: 'Hamburger.noPermissions',
    defaultMessage: 'You are not a launch owner',
  },
  launchInProgress: {
    id: 'Hamburger.launchInProgress',
    defaultMessage: 'Launch should not be in the status progress',
  },
  notYourLaunch: {
    id: 'Hamburger.notYourLaunch',
    defaultMessage: 'You are not a launch owner',
  },
});

@injectIntl
@connect((state) => ({
  projectRole: activeProjectRoleSelector(state),
  userId: userIdSelector(state),
  accountRole: userAccountRoleSelector(state),
  projectId: activeProjectSelector(state),
}))
@track()
export class Hamburger extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userId: PropTypes.string.isRequired,
    projectRole: PropTypes.string.isRequired,
    onAction: PropTypes.func,
    launch: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    customProps: PropTypes.object,
    accountRole: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    onAction: () => {},
    customProps: {},
    accountRole: '',
  };

  state = {
    menuShown: false,
    disableEventTrack: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  onExportLaunch = (type) => {
    window.location.href = URLS.exportLaunch(this.props.projectId, this.props.launch.id, type);
  };

  getForceFinishTooltip = () => {
    const { intl, projectRole, accountRole } = this.props;
    let forceFinishTitle = '';

    if (
      !canForceFinishLaunch(accountRole, projectRole, this.props.userId === this.props.launch.owner)
    ) {
      forceFinishTitle = intl.formatMessage(messages.noPermissions);
    }
    if (!this.isInProgress()) {
      forceFinishTitle = intl.formatMessage(messages.launchFinished);
    }
    return forceFinishTitle;
  };

  getMoveToDebugTooltip = () => {
    const { intl, projectRole, accountRole, userId, launch } = this.props;
    return !canMoveToDebug(accountRole, projectRole, userId === launch.owner)
      ? intl.formatMessage(messages.noPermissions)
      : '';
  };

  getDeleteItemTooltip = () => {
    if (
      !canDeleteLaunch(
        this.props.accountRole,
        this.props.projectRole,
        this.props.userId === this.props.launch.owner,
      )
    ) {
      return this.props.intl.formatMessage(messages.notYourLaunch);
    }
    if (this.isInProgress()) {
      return this.props.intl.formatMessage(messages.launchInProgress);
    }
    return '';
  };

  isInProgress = () => this.props.launch.status === IN_PROGRESS.toUpperCase();

  exportAsPDF = () => {
    this.onExportLaunch('pdf');
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_PDF);
  };

  exportAsXLS = () => {
    this.onExportLaunch('xls');
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_XLS);
  };

  exportAsHTML = () => {
    this.onExportLaunch('html');
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_HTML);
  };

  handleOutsideClick = (e) => {
    if (this.icon && !this.icon.contains(e.target) && this.state.menuShown) {
      this.setState({ menuShown: false });
    }
  };

  toggleMenu = () => {
    this.setState({ menuShown: !this.state.menuShown });
    if (!this.state.disableEventTrack) {
      this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_HAMBURGER_MENU);
      this.setState({ disableEventTrack: true });
    }
  };

  render() {
    const { intl, projectRole, accountRole, launch, customProps, tracking } = this.props;
    return (
      <div className={cx('hamburger')}>
        <div
          ref={(icon) => {
            this.icon = icon;
          }}
          className={cx('hamburger-icon')}
          onClick={this.toggleMenu}
        >
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
        </div>
        <div className={cx('hamburger-menu', { shown: this.state.menuShown })}>
          <div className={cx('hamburger-menu-actions')}>
            {projectRole !== CUSTOMER && (
              <Fragment>
                {launch.mode === 'DEFAULT' ? (
                  <HamburgerMenuItem
                    title={this.getMoveToDebugTooltip()}
                    text={intl.formatMessage(messages.toDebug)}
                    disabled={
                      !canMoveToDebug(
                        accountRole,
                        projectRole,
                        this.props.userId === this.props.launch.owner,
                      )
                    }
                    onClick={() => {
                      tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MOVE_TO_DEBUG_LAUNCH_MENU);
                      customProps.onMove(launch);
                    }}
                  />
                ) : (
                  <HamburgerMenuItem
                    text={intl.formatMessage(messages.toAllLaunches)}
                    title={this.getMoveToDebugTooltip()}
                    disabled={
                      !canMoveToDebug(
                        accountRole,
                        projectRole,
                        this.props.userId === this.props.launch.owner,
                      )
                    }
                    onClick={() => {
                      customProps.onMove(launch);
                    }}
                  />
                )}
              </Fragment>
            )}
            <HamburgerMenuItem
              text={intl.formatMessage(messages.forceFinish)}
              title={this.getForceFinishTooltip()}
              disabled={
                !canForceFinishLaunch(
                  accountRole,
                  projectRole,
                  this.props.userId === this.props.launch.owner,
                ) || !this.isInProgress()
              }
              onClick={() => {
                tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_FORCE_FINISH_LAUNCH_MENU);
                customProps.onForceFinish(launch);
              }}
            />
            {launch.mode === 'DEFAULT' && (
              <HamburgerMenuItem
                text={intl.formatMessage(messages.analysis)}
                onClick={() => {
                  tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ANALYSIS_LAUNCH_MENU);
                  customProps.onAnalysis(launch);
                }}
              />
            )}
            <HamburgerMenuItem
              text={intl.formatMessage(messages.delete)}
              disabled={
                !canDeleteLaunch(
                  accountRole,
                  projectRole,
                  this.props.userId === this.props.launch.owner,
                ) || this.isInProgress()
              }
              onClick={() => {
                tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_DELETE_LAUNCH_MENU);
                customProps.onDeleteItem(launch);
              }}
              title={this.getDeleteItemTooltip()}
            />
          </div>
          <div className={cx('export-block')}>
            <div className={cx('export-label')}>
              <FormattedMessage id={'Hamburger.export'} defaultMessage={'Export:'} />
            </div>
            <div className={cx('export-buttons')}>
              <div className={cx('export-button')}>
                <GhostButton tiny onClick={this.exportAsPDF} disabled={this.isInProgress()}>
                  PDF
                </GhostButton>
              </div>
              <div className={cx('export-button')}>
                <GhostButton tiny onClick={this.exportAsXLS} disabled={this.isInProgress()}>
                  XLS
                </GhostButton>
              </div>
              <div className={cx('export-button')}>
                <GhostButton tiny onClick={this.exportAsHTML} disabled={this.isInProgress()}>
                  HTML
                </GhostButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
