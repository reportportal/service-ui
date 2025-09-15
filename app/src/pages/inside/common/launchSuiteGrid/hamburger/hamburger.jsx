/*
 * Copyright 2025 EPAM Systems
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

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { updateLaunchLocallyAction } from 'controllers/launch';
import { showModalAction } from 'controllers/modal';
import { enabledPattersSelector, projectKeySelector } from 'controllers/project';
import { analyzerExtensionsSelector, importantLaunchesEnabledSelector } from 'controllers/appInfo';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { LaunchExportModal } from 'pages/inside/launchesPage/modals/launchExportModal';
import { HamburgerMenuItem } from './hamburgerMenuItem';
import { messages } from './messages';
import styles from './hamburger.scss';
import { useUserPermissions } from 'hooks/useUserPermissions';

const cx = classNames.bind(styles);

export const Hamburger = ({ launch, customProps }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const [menuShown, setMenuShown] = useState(false);
  const [disableEventTrack, setDisableEventTrack] = useState(false);
  const iconRef = useRef(null);
  const {
    canForceFinishLaunch,
    canMoveToDebug,
    canDeleteLaunch,
    canSeeRowActionMenu,
    canStartAnalysis,
  } = useUserPermissions();
  const projectKey = useSelector(projectKeySelector);
  const enabledPatterns = useSelector(enabledPattersSelector);
  const analyzerExtensions = useSelector(analyzerExtensionsSelector);
  const areImportantLaunchesEnabled = useSelector(importantLaunchesEnabledSelector);

  const isLaunchInProgress = launch.status === IN_PROGRESS.toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (iconRef.current && !iconRef.current.contains(e.target) && menuShown) {
        setMenuShown(false);
      }
    };

    document.addEventListener('click', handleOutsideClick, false);
    return () => {
      document.removeEventListener('click', handleOutsideClick, false);
    };
  }, [menuShown]);

  const onExportReport = () => {
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EXPORT_REPORT);
    dispatch(
      showModalAction({
        component: <LaunchExportModal name={launch.name} id={launch.id} />,
      }),
    );
  };

  const toggleMenu = () => {
    setMenuShown(!menuShown);
    if (!disableEventTrack) {
      trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_HAMBURGER_MENU);
      setDisableEventTrack(true);
    }
  };

  const getForceFinishTooltip = () => {
    let forceFinishTitle = '';

    if (!canForceFinishLaunch) {
      forceFinishTitle = formatMessage(messages.noPermissions);
    }
    if (!isLaunchInProgress) {
      forceFinishTitle = formatMessage(messages.launchFinished);
    }
    return forceFinishTitle;
  };

  const getMoveToDebugTooltip = () => {
    return !canMoveToDebug ? formatMessage(messages.noPermissions) : '';
  };

  const getDeleteItemTooltip = () => {
    if (!canDeleteLaunch) {
      return formatMessage(messages.notYourLaunch);
    }
    if (isLaunchInProgress) {
      return formatMessage(messages.launchInProgress);
    }
    return '';
  };

  const updateLaunchLocally = (updatedLaunch) => {
    dispatch(updateLaunchLocallyAction(updatedLaunch));
  };

  const openUniqueErrorAnalysisModal = () => {
    dispatch(
      showModalAction({
        id: 'uniqueErrorsAnalyzeModal',
        data: {
          launch,
          updateLaunchLocally,
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
          onSuccess: updateLaunchLocally,
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

  const getImportantLaunchesTitle = () => {
    if (!areImportantLaunchesEnabled) {
      return formatMessage(messages.importantControlsDisabledTooltip);
    } else if (!canDeleteLaunch) {
      return formatMessage(messages.noPermissions);
    }
    return '';
  };
  const clusterTitle = getClusterTitle();
  const importantLaunchesTitle = getImportantLaunchesTitle();

  return (
    <div className={cx('hamburger')}>
      <button ref={iconRef} className={cx('hamburger-icon')} onClick={toggleMenu}>
        <div className={cx('hamburger-icon-part')} />
        <div className={cx('hamburger-icon-part')} />
        <div className={cx('hamburger-icon-part')} />
      </button>
      <div className={cx('hamburger-menu', { shown: menuShown })}>
        <div className={cx('hamburger-menu-actions')}>
          {canSeeRowActionMenu && (
            <Fragment>
              {launch.mode === 'DEFAULT' ? (
                <HamburgerMenuItem
                  title={getMoveToDebugTooltip()}
                  text={formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG)}
                  disabled={!canMoveToDebug}
                  onClick={() => {
                    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MOVE_TO_DEBUG_LAUNCH_MENU);
                    customProps.onMove(launch);
                  }}
                />
              ) : (
                <HamburgerMenuItem
                  text={formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES)}
                  title={getMoveToDebugTooltip()}
                  disabled={!canMoveToDebug}
                  onClick={() => {
                    customProps.onMove(launch);
                  }}
                />
              )}
              <HamburgerMenuItem
                text={formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH)}
                title={getForceFinishTooltip()}
                disabled={!canForceFinishLaunch || !isLaunchInProgress}
                onClick={() => {
                  trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_FORCE_FINISH_LAUNCH_MENU);
                  customProps.onForceFinish(launch);
                }}
              />
              <HamburgerMenuItem
                disabled={!!importantLaunchesTitle}
                title={importantLaunchesTitle}
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
                  disabled={!canStartAnalysis}
                  text={formatMessage(messages.analysis)}
                  onClick={() => {
                    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ANALYSIS_LAUNCH_MENU);
                    customProps.onAnalysis(launch);
                  }}
                />
              )}
              <HamburgerMenuItem
                disabled={!!clusterTitle || !canStartAnalysis}
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
                disabled={!enabledPatterns.length}
              />
              <HamburgerMenuItem
                text={formatMessage(COMMON_LOCALE_KEYS.DELETE)}
                disabled={!canDeleteLaunch || isLaunchInProgress}
                onClick={() => {
                  trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_DELETE_LAUNCH_MENU);
                  customProps.onDeleteItem(launch);
                }}
                title={getDeleteItemTooltip()}
              />
            </Fragment>
          )}
          <HamburgerMenuItem
            text={formatMessage(messages.exportReport)}
            disabled={isLaunchInProgress}
            onClick={onExportReport}
            title={isLaunchInProgress ? formatMessage(messages.launchInProgress) : ''}
          />
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
