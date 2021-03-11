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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
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
import { showModalAction } from 'controllers/modal';
import { historyItemsSelector, updateHistoryItemIssuesAction } from 'controllers/log';
import { getDefectTypeSelector } from 'controllers/project';
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import {
  availableBtsIntegrationsSelector,
  isPostIssueActionAvailable,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from 'controllers/plugins';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
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
const POST_ISSUE_EVENTS_INFO = {
  postBtn: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.POST_BTN_POST_ISSUE_MODAL,
  attachmentsSwitcher:
    LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.ATTACHMENTS_SWITCHER_POST_ISSUE_MODAL,
  logsSwitcher: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.LOGS_SWITCHER_POST_ISSUE_MODAL,
  commentSwitcher: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.COMMENT_SWITCHER_POST_ISSUE_MODAL,
  cancelBtn: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CANCEL_BTN_POST_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CLOSE_ICON_POST_ISSUE_MODAL,
};
const LINK_ISSUE_EVENTS_INFO = {
  loadBtn: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.LOAD_BTN_LINK_ISSUE_MODAL,
  cancelBtn: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_LINK_ISSUE_MODAL,
  addNewIssue: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_LINK_ISSUE_MODAL,
};
const UNLINK_ISSUE_EVENTS_INFO = {
  unlinkAutoAnalyzedFalse:
    LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_FALSE,
  unlinkAutoAnalyzedTrue:
    LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_TRUE,
  unlinkBtn: LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_BTN_UNLINK_ISSUE_MODAL,
  cancelBtn: LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_UNLINK_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_UNLINK_ISSUE_MODAL,
};

@connect(
  (state) => ({
    historyItems: historyItemsSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
    getDefectType: getDefectTypeSelector(state),
    isBtsPluginsExist: isBtsPluginsExistSelector(state),
    enabledBtsPlugins: enabledBtsPluginsSelector(state),
  }),
  {
    linkIssueAction,
    unlinkIssueAction,
    postIssueAction,
    editDefectsAction,
    showModalAction,
    updateHistoryItemIssues: updateHistoryItemIssuesAction,
  },
)
@track()
@injectIntl
export class DefectDetails extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    editDefectsAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    unlinkIssueAction: PropTypes.func.isRequired,
    postIssueAction: PropTypes.func.isRequired,
    historyItems: PropTypes.array.isRequired,
    btsIntegrations: PropTypes.array.isRequired,
    fetchFunc: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    updateHistoryItemIssues: PropTypes.func.isRequired,
    debugMode: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    logItem: PropTypes.object,
    getDefectType: PropTypes.func,
    isBtsPluginsExist: PropTypes.bool,
    enabledBtsPlugins: PropTypes.array,
  };
  static defaultProps = {
    logItem: null,
    getDefectType: () => {},
    isBtsPluginsExist: false,
    enabledBtsPlugins: [],
  };

  state = {
    expanded: false,
  };

  getIssueActionTitle = (noIssueMessage, isPostIssueUnavailable) => {
    const {
      logItem,
      intl: { formatMessage },
      btsIntegrations,
      isBtsPluginsExist,
      enabledBtsPlugins,
    } = this.props;

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

  isDefectTypeVisible = () => {
    const { logItem } = this.props;
    return logItem.issue && logItem.issue.issueType;
  };

  handleLinkIssue = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.LINK_ISSUE_ACTION);
    this.props.linkIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
      eventsInfo: LINK_ISSUE_EVENTS_INFO,
    });
  };

  handleUnlinkTicket = (ticketId) => {
    const { logItem, fetchFunc, tracking } = this.props;
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

    tracking.trackEvent(LOG_PAGE_EVENTS.UNLINK_ISSUES_ACTION);

    this.props.unlinkIssueAction(items, {
      fetchFunc,
      eventsInfo: UNLINK_ISSUE_EVENTS_INFO,
    });
  };

  handlePostIssue = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.POST_ISSUE_ACTION);
    this.props.postIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
      eventsInfo: POST_ISSUE_EVENTS_INFO,
    });
  };

  onDefectEdited = (issues) => {
    const { fetchFunc, updateHistoryItemIssues } = this.props;

    if (issues) {
      updateHistoryItemIssues(issues);
    } else {
      fetchFunc();
    }
  };

  handleEditDefect = () => {
    const { logItem } = this.props;
    if (this.isDefectGroupOperationAvailable()) {
      this.props.showModalAction({
        id: 'editToInvestigateDefectModal',
        data: {
          item: logItem,
          fetchFunc: this.onDefectEdited,
          eventsInfo: {
            changeSearchMode: LOG_PAGE_EVENTS.CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL,
            selectAllSimilarItems: LOG_PAGE_EVENTS.SELECT_ALL_SIMILAR_ITEMS_EDIT_DEFECT_MODAL,
            selectSpecificSimilarItem:
              LOG_PAGE_EVENTS.SELECT_SPECIFIC_SIMILAR_ITEM_EDIT_DEFECT_MODAL,
            editDefectsEvents: LOG_PAGE_EVENTS.EDIT_DEFECT_MODAL_EVENTS,
            unlinkIssueEvents: UNLINK_ISSUE_EVENTS_INFO,
            postIssueEvents: POST_ISSUE_EVENTS_INFO,
            linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
          },
        },
      });
    } else {
      this.props.editDefectsAction([this.props.logItem], {
        fetchFunc: this.onDefectEdited,
        debugMode: this.props.debugMode,
        eventsInfo: {
          editDefectsEvents: LOG_PAGE_EVENTS.EDIT_DEFECT_MODAL_EVENTS,
          unlinkIssueEvents: UNLINK_ISSUE_EVENTS_INFO,
          postIssueEvents: POST_ISSUE_EVENTS_INFO,
          linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
        },
      });
    }
  };

  toggleExpanded = () => {
    this.setState((state) => ({
      expanded: !state.expanded,
    }));
  };

  isDefectGroupOperationAvailable = () => {
    const { logItem } = this.props;
    return (
      logItem.issue &&
      logItem.issue.issueType &&
      this.props.getDefectType(logItem.issue.issueType).typeRef.toUpperCase() ===
        TO_INVESTIGATE.toUpperCase() &&
      !this.props.debugMode
    );
  };

  render() {
    const {
      logItem,
      btsIntegrations,
      debugMode,
      intl: { formatMessage },
    } = this.props;
    const { expanded } = this.state;
    const isPostIssueUnavailable = !isPostIssueActionAvailable(this.props.btsIntegrations);

    return (
      <div className={cx('details-container')}>
        {this.isDefectTypeVisible() && (
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
                <Fragment>
                  <span className={cx('details-row-caption')}>
                    <span className={cx('icon')}>{Parser(BugIcon)}</span>
                    {formatMessage(messages.btsLink)}
                  </span>
                  <div className={cx('issues')}>
                    <IssueList
                      issues={logItem.issue.externalSystemIssues}
                      onRemove={this.handleUnlinkTicket}
                    />
                  </div>
                  <GhostButton
                    tiny
                    icon={PlusIcon}
                    transparentBorder
                    transparentBorderHover
                    disabled={!logItem.issue || isPostIssueUnavailable}
                    onClick={this.handlePostIssue}
                    title={
                      !logItem.issue || isPostIssueUnavailable
                        ? this.getIssueActionTitle(
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
                    onClick={this.handleLinkIssue}
                    title={
                      !logItem.issue || !btsIntegrations.length
                        ? this.getIssueActionTitle(
                            messages.noDefectTypeToLinkIssue,
                            isPostIssueUnavailable,
                          )
                        : ''
                    }
                  >
                    {formatMessage(messages.linkIssue)}
                  </GhostButton>
                </Fragment>
              )}
            </div>
          </div>
        )}

        <div className={cx('defect-type')}>
          {this.isDefectTypeVisible() && (
            <Fragment>
              {expanded ? null : (
                <div className={cx('collapsed-info')}>
                  <span className={cx('issues-info')}>
                    <span className={cx('icon')}>{Parser(BugIcon)}</span>
                    {logItem.issue.externalSystemIssues.length}
                  </span>
                  <span className={cx('expand-more')} onClick={this.toggleExpanded}>
                    <span className={cx('icon')}>{Parser(ArrowDownIcon)}</span>
                    {formatMessage(messages.more)}
                  </span>
                </div>
              )}
              {logItem.issue.ignoreAnalyzer && <IgnoredInAALabel />}
              {logItem.issue.autoAnalyzed && <AALabel />}
              {!!logItem.patternTemplates.length && (
                <PALabel patternTemplates={logItem.patternTemplates} />
              )}
              <DefectTypeItem
                type={logItem.issue.issueType}
                noBorder
                onClick={null}
                className={cx('defect-item')}
              />
            </Fragment>
          )}
          {!debugMode && (
            <div className={cx('make-decision-action')}>
              <GhostButton
                disabled={!logItem.issue}
                onClick={this.handleEditDefect}
                title={!logItem.issue && formatMessage(messages.makeDecisionTooltip)}
              >
                {formatMessage(messages.makeDecision)}
              </GhostButton>
            </div>
          )}
          {expanded && logItem.issue && (
            <span className={cx('expand-more', 'collapse')} onClick={this.toggleExpanded}>
              <span className={cx('icon')}>{Parser(ArrowDownIcon)}</span>
              {formatMessage(messages.showLess)}
            </span>
          )}
        </div>
      </div>
    );
  }
}
