/*
 * Copyright 2021 EPAM Systems
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { GhostButton } from 'components/buttons/ghostButton';
import { getIssueTitle } from 'pages/inside/common/utils';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  linkIssueAction,
  unlinkIssueAction,
  postIssueAction,
  editDefectsAction,
} from 'controllers/step';
import { fetchHistoryItemsWithLoadingAction, updateHistoryItemIssuesAction } from 'controllers/log';
import {
  availableBtsIntegrationsSelector,
  isPostIssueActionAvailable,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { StatusDropdown } from 'pages/inside/common/statusDropdown';
import PlusIcon from 'common/img/plus-button-inline.svg';
import CommentIcon from 'common/img/comment-inline.svg';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import BugIcon from 'common/img/bug-inline.svg';
import { IssueList } from 'pages/inside/stepPage/stepGrid/defectType/issueList';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MarkdownViewer } from 'components/main/markdown';
import {
  AALabel,
  IgnoredInAALabel,
  PALabel,
} from 'pages/inside/stepPage/stepGrid/defectType/defectType';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { isEnterOrSpaceKey } from 'common/utils/helperUtils/event.utils';
import styles from './defectDetails.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  postIssue: {
    id: 'LogItemInfo.postIssue',
    defaultMessage: 'Post',
  },
  linkIssue: {
    id: 'LogItemInfo.linkIssue',
    defaultMessage: 'Link',
  },
  makeDecision: {
    id: 'LogItemInfo.makeDecision',
    defaultMessage: 'Make decision',
  },
  makeDecisionTooltip: {
    id: 'LogItemInfo.makeDecisionTooltip',
    defaultMessage: 'Action is unavailable for item with no defect type',
  },
  more: {
    id: 'LogItemInfo.more',
    defaultMessage: 'More',
  },
  showLess: {
    id: 'LogItemInfo.showLess',
    defaultMessage: 'Show Less',
  },
  btsLink: {
    id: 'LogItemInfo.btsLink',
    defaultMessage: 'BTS Link',
  },
  comment: {
    id: 'LogItemInfo.comment',
    defaultMessage: 'Comment',
  },
});

const getPostIssueEventsInfo = (place) => ({
  postBtn: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.getClickPostIssueButtonEventParameters(place),
  cancelBtn: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CANCEL_BTN_POST_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CLOSE_ICON_POST_ISSUE_MODAL,
});
const getLinkIssueEventsInfo = (place) => ({
  loadBtn: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.getClickLoadButtonEventParameters(place),
  cancelBtn: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_LINK_ISSUE_MODAL,
  addNewIssue:
    LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.getClickAddNewIssueButtonEventParameters(place),
  closeIcon: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_LINK_ISSUE_MODAL,
});
const getUnlinkIssueEventsInfo = (place) => ({
  unlinkBtn: LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.getClickUnlinkButtonEventParameters(place),
  cancelBtn: LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_UNLINK_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_UNLINK_ISSUE_MODAL,
});

export const DefectDetails = ({ fetchFunc, debugMode, logItem }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const btsIntegrations = useSelector(availableBtsIntegrationsSelector);
  const isBtsPluginsExist = useSelector(isBtsPluginsExistSelector);
  const enabledBtsPlugins = useSelector(enabledBtsPluginsSelector);
  const [expanded, setExpanded] = useState(false);
  const { canChangeTestItemStatus, canMakeDecision, canManageBTSIssues } = useUserPermissions();

  const isDefectTypeVisible = logItem.issue?.issueType;
  const getIssueActionTitle = (noIssueMessage, isPostIssueUnavailable) => {
    if (!logItem.issue) {
      return formatMessage(noIssueMessage);
    }

    return getIssueTitle(
      formatMessage,
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
      isPostIssueUnavailable,
    );
  };

  const handleLinkIssue = () => {
    trackEvent(LOG_PAGE_EVENTS.LINK_ISSUE_ACTION);
    dispatch(
      linkIssueAction([logItem], {
        fetchFunc,
        eventsInfo: getLinkIssueEventsInfo(),
      }),
    );
  };

  const handleUnlinkTicket = (ticketId) => {
    const items = [
      {
        ...logItem,
        issue: {
          ...logItem.issue,
          externalSystemIssues: logItem.issue.externalSystemIssues.filter(
            (issue) => issue.ticketId === ticketId,
          ),
        },
      },
    ];

    trackEvent(LOG_PAGE_EVENTS.UNLINK_ISSUES_ACTION);

    dispatch(
      unlinkIssueAction(items, {
        fetchFunc,
        eventsInfo: getUnlinkIssueEventsInfo(),
      }),
    );
  };

  const handlePostIssue = () => {
    trackEvent(LOG_PAGE_EVENTS.POST_ISSUE_ACTION);
    dispatch(
      postIssueAction([logItem], {
        fetchFunc,
        eventsInfo: getPostIssueEventsInfo(),
      }),
    );
  };

  const onDefectEdited = (issues) => {
    if (issues) {
      dispatch(updateHistoryItemIssuesAction(issues));
    } else {
      fetchFunc();
    }
  };

  const handleEditDefect = () => {
    const MAKE_DECISION = 'make_decision';

    trackEvent(
      LOG_PAGE_EVENTS.MAKE_DECISION_MODAL_EVENTS.getOpenModalEvent(
        logItem.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX),
      ),
    );
    dispatch(
      editDefectsAction([logItem], {
        fetchFunc: onDefectEdited,
        eventsInfo: {
          changeSearchMode: LOG_PAGE_EVENTS.CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL,
          selectAllSimilarItems: LOG_PAGE_EVENTS.SELECT_ALL_SIMILAR_ITEMS_EDIT_DEFECT_MODAL,
          selectSpecificSimilarItem: LOG_PAGE_EVENTS.SELECT_SPECIFIC_SIMILAR_ITEM_EDIT_DEFECT_MODAL,
          editDefectsEvents: LOG_PAGE_EVENTS.MAKE_DECISION_MODAL_EVENTS,
          unlinkIssueEvents: getUnlinkIssueEventsInfo(MAKE_DECISION),
          postIssueEvents: getPostIssueEventsInfo(MAKE_DECISION),
          linkIssueEvents: getLinkIssueEventsInfo(MAKE_DECISION),
        },
      }),
    );
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    trackEvent(LOG_PAGE_EVENTS.getClickOnDefectDetailsTogglerEvent(expanded));
  };

  const onChangeStatus = (status) => trackEvent(LOG_PAGE_EVENTS.getChangeItemStatusEvent(status));

  const onClickIssue = (pluginName) => {
    trackEvent(LOG_PAGE_EVENTS.onClickIssueTicketEvent(pluginName));
  };

  const isPostIssueUnavailable = !isPostIssueActionAvailable(btsIntegrations);

  return (
    <div className={cx('details-container')}>
      {isDefectTypeVisible && (
        <div className={cx('defect-details')}>
          <div className={cx('details-row', 'start-align')}>
            <span className={cx('details-row-caption')}>
              <span className={cx('icon')}>{Parser(CommentIcon)}</span>
              {formatMessage(messages.comment)}
            </span>
            <div className={cx('comment', { expanded })}>
              {expanded ? (
                <ScrollWrapper autoHeight autoHeightMax={90}>
                  <MarkdownViewer value={logItem.issue.comment} />
                </ScrollWrapper>
              ) : (
                <MarkdownViewer value={logItem.issue.comment} />
              )}
            </div>
          </div>

          <div className={cx('details-row')}>
            {expanded && (
              <>
                <span className={cx('details-row-caption')}>
                  <span className={cx('icon')}>{Parser(BugIcon)}</span>
                  {formatMessage(messages.btsLink)}
                </span>
                <div className={cx('issues')}>
                  <IssueList
                    issues={logItem.issue.externalSystemIssues}
                    onRemove={handleUnlinkTicket}
                    onClick={onClickIssue}
                    readOnly={!canManageBTSIssues}
                  />
                </div>
                {!debugMode && canManageBTSIssues && (
                  <>
                    <GhostButton
                      tiny
                      icon={PlusIcon}
                      transparentBorder
                      transparentBorderHover
                      disabled={!logItem.issue || isPostIssueUnavailable}
                      onClick={handlePostIssue}
                      title={
                        !logItem.issue || isPostIssueUnavailable
                          ? getIssueActionTitle(
                              messages.noDefectTypeToPostIssue,
                              isPostIssueUnavailable,
                            )
                          : ''
                      }
                    >
                      {formatMessage(messages.postIssue)}
                    </GhostButton>
                    <GhostButton
                      icon={PlusIcon}
                      transparentBorder
                      transparentBorderHover
                      disabled={!logItem.issue || !btsIntegrations.length}
                      onClick={handleLinkIssue}
                      title={
                        !logItem.issue || !btsIntegrations.length
                          ? getIssueActionTitle(
                              messages.noDefectTypeToLinkIssue,
                              isPostIssueUnavailable,
                            )
                          : ''
                      }
                    >
                      {formatMessage(messages.linkIssue)}
                    </GhostButton>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <div className={cx('defect-type')}>
        {isDefectTypeVisible && (
          <>
            {expanded ? null : (
              <div className={cx('collapsed-info')}>
                <button
                  className={cx('expand-more')}
                  onClick={toggleExpanded}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (isEnterOrSpaceKey(e)) {
                      toggleExpanded();
                    }
                  }}
                >
                  <span className={cx('icon')}>{Parser(ArrowDownIcon)}</span>
                  {formatMessage(messages.more)}
                </button>
                <span className={cx('issues-info', 'with-separator')}>
                  <span className={cx('icon')}>{Parser(BugIcon)}</span>
                  {logItem.issue.externalSystemIssues.length}
                </span>
              </div>
            )}
            {logItem.issue.ignoreAnalyzer && <IgnoredInAALabel />}
            {logItem.issue.autoAnalyzed && <AALabel />}
            {!!logItem.patternTemplates.length && (
              <PALabel patternTemplates={logItem.patternTemplates} />
            )}
          </>
        )}
        <span className={cx('status-wrapper', 'with-separator')}>
          <StatusDropdown
            itemId={logItem.id}
            status={logItem.status}
            attributes={logItem.attributes}
            description={logItem.description}
            fetchFunc={() => dispatch(fetchHistoryItemsWithLoadingAction())}
            onChange={onChangeStatus}
            withIndicator
            readOnly={!canChangeTestItemStatus}
          />
        </span>
        {isDefectTypeVisible && (
          <span className={cx('defect-item-wrapper', 'with-separator')}>
            <DefectTypeItem
              type={logItem.issue.issueType}
              noBorder
              onClick={null}
              className={cx('defect-item')}
            />
          </span>
        )}
        {!debugMode && canMakeDecision && (
          <div className={cx('make-decision-action')}>
            <GhostButton
              color="white"
              disabled={!logItem.issue}
              onClick={handleEditDefect}
              title={!logItem.issue ? formatMessage(messages.makeDecisionTooltip) : ''}
            >
              {formatMessage(messages.makeDecision)}
            </GhostButton>
          </div>
        )}
        {expanded && logItem.issue && (
          <button
            className={cx('expand-more', 'collapse')}
            onClick={toggleExpanded}
            tabIndex={0}
            onKeyDown={(e) => {
              if (isEnterOrSpaceKey(e)) {
                toggleExpanded();
              }
            }}
          >
            <span className={cx('icon')}>{Parser(ArrowDownIcon)}</span>
            {formatMessage(messages.showLess)}
          </button>
        )}
      </div>
    </div>
  );
};

DefectDetails.propTypes = {
  fetchFunc: PropTypes.func.isRequired,
  debugMode: PropTypes.bool.isRequired,
  logItem: PropTypes.object,
};

DefectDetails.defaultProps = {
  logItem: null,
};
