/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { CUSTOMER } from 'common/constants/projectRoles';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { URLS } from 'common/urls';
import { downloadFile } from 'common/utils/downloadFile';
import { canDeleteLaunch, canForceFinishLaunch, canMoveToDebug } from 'common/utils/permissions';
import { updateLaunchLocallyAction } from 'controllers/launch';
import { showModalAction } from 'controllers/modal';
import {
  activeProjectRoleSelector,
  userIdSelector,
  userAccountRoleSelector,
  activeProjectSelector,
} from 'controllers/user';
import { enabledPattersSelector } from 'controllers/project';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { HamburgerMenuItem } from './hamburgerMenuItem';
import styles from './hamburger.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  analysis: {
    id: 'Hamburger.analysis',
    defaultMessage: 'Analysis',
  },
  noPatternsEnabled: {
    id: 'Hamburger.noPatternsEnabled',
    defaultMessage: 'No patterns enabled',
  },
  patternAnalysis: {
    id: 'Hamburger.patternAnalysis',
    defaultMessage: 'Pattern analysis',
  },
  launchFinished: {
    id: 'Hamburger.launchFinished',
    defaultMessage: 'Launch is finished',
  },
  noPermissions: {
    id: 'Hamburger.noPermissions',
    defaultMessage: 'You are not a Launch owner',
  },
  launchInProgress: {
    id: 'Hamburger.launchInProgress',
    defaultMessage: 'Launch should not be in the status progress',
  },
  notYourLaunch: {
    id: 'Hamburger.notYourLaunch',
    defaultMessage: 'You are not a launch owner',
  },
  uniqueErrorAnalysis: {
    id: 'Hamburger.uniqueErrorAnalysis',
    defaultMessage: 'Unique Error analysis',
  },
  markAsImportant: {
    id: 'Hamburger.markAsImportant',
    defaultMessage: 'Mark as Important',
  },
  unmarkAsImportant: {
    id: 'Hamburger.unmarkAsImportant',
    defaultMessage: 'Unmark as Important',
  },
  uniqueErrorAnalysisIsInProgress: {
    id: 'Hamburger.uniqueErrorAnalysisIsInProgress',
    defaultMessage: 'Unique Error analysis is in progress',
  },
  uniqueErrorAnalysisLaunchesInProgressError: {
    id: 'Hamburger.uniqueErrorAnalysisLaunchesInProgressError',
    defaultMessage: 'Unique Error analysis can not be run for launches in progress',
  },
  serviceAnalyzerDisabledTooltip: {
    id: 'Hamburger.serviceAnalyzerDisabledTooltip',
    defaultMessage: 'Service analyzer is not running',
  },
});

@injectIntl
@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userId: userIdSelector(state),
    accountRole: userAccountRoleSelector(state),
    projectId: activeProjectSelector(state),
    enabledPatterns: enabledPattersSelector(state),
    analyzerExtensions: analyzerExtensionsSelector(state),
  }),
  {
    showModal: showModalAction,
    updateLaunchLocallyAction,
  },
)
@track()
export class Hamburger extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    projectRole: PropTypes.string.isRequired,
    launch: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    customProps: PropTypes.object,
    accountRole: PropTypes.string,
    enabledPatterns: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    showModal: PropTypes.func,
    updateLaunchLocallyAction: PropTypes.func,
    analyzerExtensions: PropTypes.array,
  };

  static defaultProps = {
    customProps: {},
    accountRole: '',
    enabledPatterns: [],
    showModal: () => {},
    updateLaunchLocallyAction: () => {},
    analyzerExtensions: [],
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
    downloadFile(URLS.exportLaunch(this.props.projectId, this.props.launch.id, type));
  };

  getForceFinishTooltip = () => {
    const { intl, projectRole, accountRole, userId, launch } = this.props;
    let forceFinishTitle = '';

    if (!canForceFinishLaunch(accountRole, projectRole, userId === launch.owner || launch.rerun)) {
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

  openUniqueErrorAnalysisModal = () => {
    this.props.showModal({
      id: 'uniqueErrorsAnalyzeModal',
      data: {
        launch: this.props.launch,
        updateLaunchLocally: (data) => this.props.updateLaunchLocallyAction(data),
        events: {
          clickAnalyzeEvent: LAUNCHES_PAGE_EVENTS.getClickOnAnalyzeUniqueErrorsEvent,
        },
      },
    });
  };

  changeImportantState = (markAsImportant) => {
    this.props.showModal({
      id: markAsImportant ? 'markAsImportantModal' : 'unmarkAsImportantModal',
      data: {
        activeProject: this.props.projectId,
        launch: this.props.launch,
        updateLaunchLocally: (data) => this.props.updateLaunchLocallyAction(data),
      },
    });
  };

  getClusterTitle = () => {
    const { launch, intl, analyzerExtensions } = this.props;

    const clusterActive = launch.analysing.find((item) => item === ANALYZER_TYPES.CLUSTER_ANALYSER);
    const isLaunchInProgress = this.isInProgress();

    if (clusterActive) {
      return intl.formatMessage(messages.uniqueErrorAnalysisIsInProgress);
    } else if (isLaunchInProgress) {
      return intl.formatMessage(messages.uniqueErrorAnalysisLaunchesInProgressError);
    } else if (!analyzerExtensions.length) {
      return intl.formatMessage(messages.serviceAnalyzerDisabledTooltip);
    } else {
      return '';
    }
  };

  render() {
    const {
      intl,
      projectRole,
      accountRole,
      launch,
      customProps,
      enabledPatterns,
      tracking,
    } = this.props;

    const clusterTitle = this.getClusterTitle();
    const canUpdateImportant = canDeleteLaunch(
      accountRole,
      projectRole,
      this.props.userId === this.props.launch.owner,
    );
    const updateImportantTitle = canUpdateImportant
      ? ''
      : intl.formatMessage(messages.noPermissions);

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
                    text={intl.formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG)}
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
                    text={intl.formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES)}
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
              text={intl.formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH)}
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
            {launch.retentionPolicy === RETENTION_POLICY.IMPORTANT ? (
              <HamburgerMenuItem
                disabled={!canUpdateImportant}
                title={updateImportantTitle}
                text={intl.formatMessage(messages.unmarkAsImportant)}
                onClick={() => {
                  this.changeImportantState();
                }}
              />
            ) : (
              <HamburgerMenuItem
                disabled={!canUpdateImportant}
                title={updateImportantTitle}
                text={intl.formatMessage(messages.markAsImportant)}
                onClick={() => {
                  this.changeImportantState(true);
                }}
              />
            )}
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
              disabled={!!clusterTitle}
              title={clusterTitle}
              text={intl.formatMessage(messages.uniqueErrorAnalysis)}
              onClick={() => {
                tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_UNIQUE_ERROR_ANALYSIS_LAUNCH_MENU);
                this.openUniqueErrorAnalysisModal();
              }}
            />
            <HamburgerMenuItem
              text={intl.formatMessage(messages.patternAnalysis)}
              title={!enabledPatterns.length && intl.formatMessage(messages.noPatternsEnabled)}
              onClick={() => {
                tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_PATTERN_ANALYSIS_LAUNCH_MENU);
                customProps.onPatternAnalysis(launch);
              }}
              disabled={!enabledPatterns.length}
            />
            <HamburgerMenuItem
              text={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
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
