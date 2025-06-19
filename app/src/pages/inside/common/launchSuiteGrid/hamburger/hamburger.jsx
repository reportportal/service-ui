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
import { useIntl, FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { CUSTOMER } from 'common/constants/projectRoles';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { URLS } from 'common/urls';
import { downloadFile } from 'common/utils/downloadFile';
import { canDeleteLaunch, canForceFinishLaunch, canMoveToDebug } from 'common/utils/permissions';
import { updateLaunchLocallyAction } from 'controllers/launch';
import { showModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import {
  activeProjectRoleSelector,
  userIdSelector,
  userAccountRoleSelector,
  activeProjectSelector,
} from 'controllers/user';
import { addExportAction, removeExportAction } from 'controllers/exports';
import { enabledPattersSelector } from 'controllers/project';
import { analyzerExtensionsSelector, importantLaunchesEnabledSelector } from 'controllers/appInfo';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { ERROR_CANCELED } from 'common/utils/fetch';
import { HamburgerMenuItem } from './hamburgerMenuItem';
import { messages } from './messages';
import styles from './hamburger.scss';

const cx = classNames.bind(styles);

export const Hamburger = ({ launch, customProps }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const [menuShown, setMenuShown] = useState(false);
  const [disableEventTrack, setDisableEventTrack] = useState(false);
  const iconRef = useRef(null);

  const projectRole = useSelector(activeProjectRoleSelector);
  const userId = useSelector(userIdSelector);
  const accountRole = useSelector(userAccountRoleSelector);
  const projectId = useSelector(activeProjectSelector);
  const enabledPatterns = useSelector(enabledPattersSelector);
  const analyzerExtensions = useSelector(analyzerExtensionsSelector);
  const areImportantLaunchesEnabled = useSelector(importantLaunchesEnabledSelector);

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

  const isInProgress = () => launch.status === IN_PROGRESS.toUpperCase();

  const onExportLaunch = async (type) => {
    const requestId = `${launch.id}_${Date.now()}`;
    const messageParams = {
      exportType: type.toUpperCase(),
      launchName: launch.name,
    };

    try {
      await downloadFile(URLS.exportLaunch(projectId, launch.id, type), {
        abort: (cancelRequest) => dispatch(addExportAction({ id: requestId, cancelRequest })),
      });
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.successExportLaunch, messageParams),
        }),
      );
    } catch (e) {
      if (e.message !== ERROR_CANCELED) {
        dispatch(
          showErrorNotification({
            message: formatMessage(messages.failExportLaunch, messageParams),
          }),
        );
      }
    } finally {
      dispatch(removeExportAction(requestId));
    }
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

  const toggleMenu = () => {
    setMenuShown(!menuShown);
    if (!disableEventTrack) {
      trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_HAMBURGER_MENU);
      setDisableEventTrack(true);
    }
  };

  const getForceFinishTooltip = () => {
    let forceFinishTitle = '';
    if (!canForceFinishLaunch(accountRole, projectRole, userId === launch.owner || launch.rerun)) {
      forceFinishTitle = formatMessage(messages.noPermissions);
    }
    if (!isInProgress()) {
      forceFinishTitle = formatMessage(messages.launchFinished);
    }
    return forceFinishTitle;
  };

  const getMoveToDebugTooltip = () => {
    return !canMoveToDebug(accountRole, projectRole, userId === launch.owner)
      ? formatMessage(messages.noPermissions)
      : '';
  };

  const getDeleteItemTooltip = () => {
    if (!canDeleteLaunch(accountRole, projectRole, userId === launch.owner)) {
      return formatMessage(messages.notYourLaunch);
    }
    if (isInProgress()) {
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
          activeProject: projectId,
          launch,
          onSuccess: updateLaunchLocally,
        },
      }),
    );
  };

  const getClusterTitle = () => {
    const clusterActive = launch.analysing.find((item) => item === ANALYZER_TYPES.CLUSTER_ANALYSER);
    const isLaunchInProgress = isInProgress();

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
    const canUpdateImportance = canDeleteLaunch(accountRole, projectRole, userId === launch.owner);

    if (!areImportantLaunchesEnabled) {
      return formatMessage(messages.importantControlsDisabledTooltip);
    } else if (!canUpdateImportance) {
      return formatMessage(messages.noPermissions);
    }

    return '';
  };

  const clusterTitle = getClusterTitle();
  const importantLaunchesTitle = getImportantLaunchesTitle();

  return (
    <div className={cx('hamburger')}>
      <div ref={iconRef} className={cx('hamburger-icon')} onClick={toggleMenu}>
        <div className={cx('hamburger-icon-part')} />
        <div className={cx('hamburger-icon-part')} />
        <div className={cx('hamburger-icon-part')} />
      </div>
      <div className={cx('hamburger-menu', { shown: menuShown })}>
        <div className={cx('hamburger-menu-actions')}>
          {projectRole !== CUSTOMER && (
            <Fragment>
              {launch.mode === 'DEFAULT' ? (
                <HamburgerMenuItem
                  title={getMoveToDebugTooltip()}
                  text={formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_DEBUG)}
                  disabled={!canMoveToDebug(accountRole, projectRole, userId === launch.owner)}
                  onClick={() => {
                    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MOVE_TO_DEBUG_LAUNCH_MENU);
                    customProps.onMove(launch);
                  }}
                />
              ) : (
                <HamburgerMenuItem
                  text={formatMessage(COMMON_LOCALE_KEYS.MOVE_TO_ALL_LAUNCHES)}
                  title={getMoveToDebugTooltip()}
                  disabled={!canMoveToDebug(accountRole, projectRole, userId === launch.owner)}
                  onClick={() => {
                    customProps.onMove(launch);
                  }}
                />
              )}
            </Fragment>
          )}
          <HamburgerMenuItem
            text={formatMessage(COMMON_LOCALE_KEYS.FORCE_FINISH)}
            title={getForceFinishTooltip()}
            disabled={
              !canForceFinishLaunch(accountRole, projectRole, userId === launch.owner) ||
              !isInProgress()
            }
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
              text={formatMessage(messages.analysis)}
              onClick={() => {
                trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ANALYSIS_LAUNCH_MENU);
                customProps.onAnalysis(launch);
              }}
            />
          )}
          <HamburgerMenuItem
            disabled={!!clusterTitle}
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
            disabled={
              !canDeleteLaunch(accountRole, projectRole, userId === launch.owner) || isInProgress()
            }
            onClick={() => {
              trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_DELETE_LAUNCH_MENU);
              customProps.onDeleteItem(launch);
            }}
            title={getDeleteItemTooltip()}
          />
        </div>
        <div className={cx('export-block')}>
          <div className={cx('export-label')}>
            <FormattedMessage id={'Hamburger.export'} defaultMessage={'Export:'} />
          </div>
          <div className={cx('export-buttons')}>
            <div className={cx('export-button')}>
              <GhostButton tiny onClick={exportAsPDF} disabled={isInProgress()}>
                PDF
              </GhostButton>
            </div>
            <div className={cx('export-button')}>
              <GhostButton tiny onClick={exportAsXLS} disabled={isInProgress()}>
                XLS
              </GhostButton>
            </div>
            <div className={cx('export-button')}>
              <GhostButton tiny onClick={exportAsHTML} disabled={isInProgress()}>
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
