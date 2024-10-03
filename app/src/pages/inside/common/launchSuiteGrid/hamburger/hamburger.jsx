/*
 * Copyright 2024 EPAM Systems
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

import React, { useEffect, useRef, useState } from 'react';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { URLS } from 'common/urls';
import { downloadFile } from 'common/utils/downloadFile';
import {
  canDeleteLaunch,
  canForceFinishLaunch,
  canMoveToDebug,
  canStartAnalysis,
} from 'common/utils/permissions';
import { updateLaunchLocallyAction } from 'controllers/launch';
import { showModalAction } from 'controllers/modal';
import { userRolesSelector } from 'controllers/pages';
import { enabledPattersSelector, projectKeySelector } from 'controllers/project';
import { analyzerExtensionsSelector } from 'controllers/appInfo';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { canSeeRowActionMenu } from 'common/utils/permissions/permissions';
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

export const Hamburger = ({ launch, customProps }) => {
  const userRoles = useSelector(userRolesSelector);
  const projectKey = useSelector(projectKeySelector);
  const enabledPatterns = useSelector(enabledPattersSelector);
  const analyzerExtensions = useSelector(analyzerExtensionsSelector);

  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const [isMenuShown, setIsMenuShown] = useState(false);
  const [disableEventTrack, setDisableEventTrack] = useState(false);
  const iconRef = useRef(null);

  const isLaunchInProgress = launch.status === IN_PROGRESS.toUpperCase();

  const onExportLaunch = (type) => {
    downloadFile(URLS.exportLaunch(projectKey, launch.id, type));
  };

  const getForceFinishTooltip = () => {
    let forceFinishTitle = '';

    if (!canForceFinishLaunch(userRoles)) {
      forceFinishTitle = formatMessage(messages.noPermissions);
    }
    if (isLaunchInProgress) {
      forceFinishTitle = formatMessage(messages.launchFinished);
    }
    return forceFinishTitle;
  };

  const getMoveToDebugTooltip = () => {
    return !canMoveToDebug(userRoles) ? formatMessage(messages.noPermissions) : '';
  };

  const getDeleteItemTooltip = () => {
    if (!canDeleteLaunch(userRoles)) {
      return formatMessage(messages.notYourLaunch);
    }
    if (isLaunchInProgress) {
      return formatMessage(messages.launchInProgress);
    }
    return '';
  };

  const exportAsPDF = () => {
    onExportLaunch('pdf');
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_PDF);
  };

  const exportAsXLS = () => {
    onExportLaunch('xls');
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_XLS);
  };

  const exportAsHTML = () => {
    onExportLaunch('html');
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_HTML);
  };

  const handleOutsideClick = (e) => {
    if (iconRef.current && !iconRef.current.contains(e.target) && isMenuShown) {
      setIsMenuShown(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuShown(!isMenuShown);
    if (!disableEventTrack) {
      trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_HAMBURGER_MENU);
      setDisableEventTrack(true);
    }
  };

  const openUniqueErrorAnalysisModal = () => {
    dispatch(
      showModalAction({
        id: 'uniqueErrorsAnalyzeModal',
        data: {
          launch,
          updateLaunchLocally: (data) => dispatch(updateLaunchLocallyAction(data)),
          events: {
            clickAnalyzeEvent: LAUNCHES_PAGE_EVENTS.getClickOnAnalyzeUniqueErrorsEvent,
          },
        },
      }),
    );
  };

  const changeImportantState = (retentionType) => {
    dispatch(
      showModalAction({
        id:
          retentionType === RETENTION_POLICY.IMPORTANT
            ? 'unmarkAsImportantModal'
            : 'markAsImportantModal',
        data: {
          activeProject: projectKey,
          launch,
          onSuccess: (data) => dispatch(updateLaunchLocallyAction(data)),
        },
      }),
    );
  };

  const getClusterTitle = () => {
    const clusterActive = launch.analysing.find((item) => item === ANALYZER_TYPES.CLUSTER_ANALYSER);

    if (clusterActive) {
      return formatMessage(messages.uniqueErrorAnalysisIsInProgress);
    } else if (isLaunchInProgress) {
      return formatMessage(messages.uniqueErrorAnalysisLaunchesInProgressError);
    } else if (!analyzerExtensions.length) {
      return formatMessage(messages.serviceAnalyzerDisabledTooltip);
    } else {
      return '';
    }
  };

  const clusterTitle = getClusterTitle();
  const canUpdateImportant = canDeleteLaunch(userRoles);
  const canSeeActions = canSeeRowActionMenu(userRoles);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick, false);

    return () => {
      document.removeEventListener('click', handleOutsideClick, false);
    };
  }, [handleOutsideClick]);

  return (
    <div className={cx('hamburger')}>
      <button ref={iconRef} className={cx('hamburger-icon')} onClick={toggleMenu}>
        <div className={cx('hamburger-icon-part')} />
        <div className={cx('hamburger-icon-part')} />
        <div className={cx('hamburger-icon-part')} />
      </button>
      <div className={cx('hamburger-menu', { shown: isMenuShown })}>
        {canSeeActions && (
          <div className={cx('hamburger-menu-actions')}>
            {launch.mode === 'DEFAULT' ? (
              <HamburgerMenuItem
                title={getMoveToDebugTooltip()}
                text={formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG)}
                disabled={!canMoveToDebug(userRoles)}
                onClick={() => {
                  trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MOVE_TO_DEBUG_LAUNCH_MENU);
                  customProps.onMove(launch);
                }}
              />
            ) : (
              <HamburgerMenuItem
                text={formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES)}
                title={getMoveToDebugTooltip()}
                disabled={!canMoveToDebug(userRoles)}
                onClick={() => {
                  customProps.onMove(launch);
                }}
              />
            )}
            <HamburgerMenuItem
              text={formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH)}
              title={getForceFinishTooltip()}
              disabled={!canForceFinishLaunch(userRoles) || !isLaunchInProgress}
              onClick={() => {
                trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_FORCE_FINISH_LAUNCH_MENU);
                customProps.onForceFinish(launch);
              }}
            />
            <HamburgerMenuItem
              disabled={!canUpdateImportant}
              title={canUpdateImportant ? '' : formatMessage(messages.noPermissions)}
              text={formatMessage(
                launch.retentionPolicy === RETENTION_POLICY.IMPORTANT
                  ? messages.unmarkAsImportant
                  : messages.markAsImportant,
              )}
              onClick={() => {
                trackEvent(
                  launch.retentionPolicy === RETENTION_POLICY.IMPORTANT
                    ? LAUNCHES_PAGE_EVENTS.CLICK_UNMARK_AS_IMPORTANT_LAUNCH_MENU
                    : LAUNCHES_PAGE_EVENTS.CLICK_MARK_AS_IMPORTANT_LAUNCH_MENU,
                );
                changeImportantState(launch.retentionPolicy);
              }}
            />
            {launch.mode === 'DEFAULT' && (
              <HamburgerMenuItem
                disabled={!canStartAnalysis(userRoles)}
                text={formatMessage(messages.analysis)}
                onClick={() => {
                  trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ANALYSIS_LAUNCH_MENU);
                  customProps.onAnalysis(launch);
                }}
              />
            )}
            <HamburgerMenuItem
              disabled={!!clusterTitle || !canStartAnalysis(userRoles)}
              title={clusterTitle}
              text={formatMessage(messages.uniqueErrorAnalysis)}
              onClick={() => {
                trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_UNIQUE_ERROR_ANALYSIS_LAUNCH_MENU);
                openUniqueErrorAnalysisModal();
              }}
            />
            <HamburgerMenuItem
              text={formatMessage(messages.patternAnalysis)}
              title={!enabledPatterns.length && formatMessage(messages.noPatternsEnabled)}
              onClick={() => {
                trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_PATTERN_ANALYSIS_LAUNCH_MENU);
                customProps.onPatternAnalysis(launch);
              }}
              disabled={!enabledPatterns.length || !canStartAnalysis(userRoles)}
            />
            <HamburgerMenuItem
              text={formatMessage(COMMON_LOCALE_KEYS.DELETE)}
              disabled={!canDeleteLaunch(userRoles) || isLaunchInProgress}
              onClick={() => {
                trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_DELETE_LAUNCH_MENU);
                customProps.onDeleteItem(launch);
              }}
              title={getDeleteItemTooltip()}
            />
          </div>
        )}
        <div className={cx('export-block')}>
          <div className={cx('export-label')}>
            <FormattedMessage id={'Hamburger.export'} defaultMessage={'Export:'} />
          </div>
          <div className={cx('export-buttons')}>
            <div className={cx('export-button')}>
              <GhostButton tiny onClick={exportAsPDF} disabled={isLaunchInProgress}>
                PDF
              </GhostButton>
            </div>
            <div className={cx('export-button')}>
              <GhostButton tiny onClick={exportAsXLS} disabled={isLaunchInProgress}>
                XLS
              </GhostButton>
            </div>
            <div className={cx('export-button')}>
              <GhostButton tiny onClick={exportAsHTML} disabled={isLaunchInProgress}>
                HTML
              </GhostButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Hamburger.propTypes = {
  launch: PropTypes.object.isRequired,
  customProps: PropTypes.object,
};

Hamburger.defaultProps = {
  customProps: {},
};
