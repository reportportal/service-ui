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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { DefectType } from 'pages/inside/stepPage/stepGrid/defectType';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  linkIssueAction,
  unlinkIssueAction,
  postIssueAction,
  editDefectsAction,
} from 'controllers/step';
import { showModalAction } from 'controllers/modal';
import {
  activeLogSelector,
  historyItemsSelector,
  activeRetryIdSelector,
  retriesSelector,
  RETRY_ID,
  NAMESPACE,
} from 'controllers/log';
import { getDefectTypeSelector } from 'controllers/project';
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import { MANY } from 'common/constants/launchStatuses';
import { availableBtsIntegrationsSelector, isPostIssueActionAvailable } from 'controllers/plugins';
import { connectRouter } from 'common/utils';
import LinkIcon from 'common/img/link-inline.svg';
import DownLeftArrowIcon from 'common/img/down-left-arrow-inline.svg';
import UpRightArrowIcon from 'common/img/up-right-arrow-inline.svg';
import BugIcon from 'common/img/bug-inline.svg';
import { LogItemInfoTabs } from './logItemInfoTabs';
import { Retry } from './retry';
import styles from './logItemInfo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  copyDefect: {
    id: 'LogItemInfo.copyDefect',
    defaultMessage: 'Copy defect {prefix} {message}',
  },
  sendDefect: {
    id: 'LogItemInfo.sendDefect',
    defaultMessage: 'Send defect to {message}',
  },
  fromPrefix: {
    id: 'LogItemInfo.fromPrefix',
    defaultMessage: 'from',
  },
  postIssue: {
    id: 'LogItemInfo.postIssue',
    defaultMessage: 'Post issue',
  },
  linkIssue: {
    id: 'LogItemInfo.linkIssue',
    defaultMessage: 'Link issue',
  },
  noDefectTypeToLinkIssue: {
    id: 'LogItemInfo.noDefectTypeToLinkIssue',
    defaultMessage: "You can't link issue if item has no defect type",
  },
  noDefectTypeToPostIssue: {
    id: 'LogItemInfo.noDefectTypeToPostIssue',
    defaultMessage: "You can't post issue if item has no defect type",
  },
  noDefectTypeToCopySendDefect: {
    id: 'LogItemInfo.noDefectTypeToCopySendDefect',
    defaultMessage: "You can't copy/send defect if item has no defect type",
  },
  retries: {
    id: 'LogItemInfo.retries',
    defaultMessage: 'Retries',
  },
});
const POST_BUG_EVENTS_INFO = {
  postBtn: LOG_PAGE_EVENTS.POST_BTN_POST_ISSUE_MODAL,
  attachmentsSwitcher: LOG_PAGE_EVENTS.ATTACHMENTS_SWITCHER_POST_ISSUE_MODAL,
  logsSwitcher: LOG_PAGE_EVENTS.LOGS_SWITCHER_POST_ISSUE_MODAL,
  commentSwitcher: LOG_PAGE_EVENTS.COMMENT_SWITCHER_POST_ISSUE_MODAL,
  cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_POST_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.CLOSE_ICON_POST_ISSUE_MODAL,
};
const LINK_ISSUE_EVENTS_INFO = {
  loadBtn: LOG_PAGE_EVENTS.LOAD_BTN_LINK_ISSUE_MODAL,
  cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_LINK_ISSUE_MODAL,
  addNewIssue: LOG_PAGE_EVENTS.ADD_NEW_ISSUE_LINK_ISSUE_MODAL,
  closeIcon: LOG_PAGE_EVENTS.CLOSE_ICON_LINK_ISSUE_MODAL,
};

@connect(
  (state) => ({
    logItem: activeLogSelector(state),
    historyItems: historyItemsSelector(state),
    btsIntegrations: availableBtsIntegrationsSelector(state),
    retryItemId: activeRetryIdSelector(state),
    retries: retriesSelector(state),
    getDefectType: getDefectTypeSelector(state),
  }),
  {
    linkIssueAction,
    unlinkIssueAction,
    postIssueAction,
    editDefectsAction,
    showModalAction,
  },
)
@track()
@connectRouter(
  () => {},
  {
    updateRetryId: (id) => ({ [RETRY_ID]: id }),
  },
  { namespace: NAMESPACE },
)
@injectIntl
export class LogItemInfo extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeLogLevel: PropTypes.func.isRequired,
    editDefectsAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    unlinkIssueAction: PropTypes.func.isRequired,
    postIssueAction: PropTypes.func.isRequired,
    historyItems: PropTypes.array.isRequired,
    btsIntegrations: PropTypes.array.isRequired,
    fetchFunc: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    onToggleSauceLabsIntegrationView: PropTypes.func.isRequired,
    isSauceLabsIntegrationView: PropTypes.bool.isRequired,
    debugMode: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    logItem: PropTypes.object,
    updateRetryId: PropTypes.func,
    retryItemId: PropTypes.number,
    retries: PropTypes.arrayOf(PropTypes.object),
    getDefectType: PropTypes.func,
  };
  static defaultProps = {
    logItem: null,
    updateRetryId: () => {},
    retryItemId: null,
    retries: [],
    getDefectType: () => {},
  };

  getIssueActionTitle = (noIssueMessage, isBtsUnavailable) => {
    const {
      logItem,
      intl: { formatMessage },
    } = this.props;
    let title = '';

    if (!logItem.issue) {
      title = formatMessage(noIssueMessage);
    } else if (isBtsUnavailable) {
      title = formatMessage(COMMON_LOCALE_KEYS.NO_BTS_INTEGRATION);
    }

    return title;
  };

  getCopyDefectButtonText = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const lastItemWithDefect = this.getLastWithDefect();
    return formatMessage(messages.copyDefect, {
      prefix: lastItemWithDefect ? formatMessage(messages.fromPrefix) : '',
      message: lastItemWithDefect ? `#${lastItemWithDefect.launchNumber}` : '',
    });
  };

  getSendDefectButtonText = () => {
    const lastHistoryItem = this.getLastHistoryItem();
    return this.props.intl.formatMessage(messages.sendDefect, {
      message: `#${lastHistoryItem.launchNumber}`,
    });
  };

  getLastWithDefect = () => {
    const reversedHistoryItems = [...this.props.historyItems];
    reversedHistoryItems.pop();
    reversedHistoryItems.reverse();

    return reversedHistoryItems.find((item) => item.issue && item.status !== MANY.toUpperCase());
  };

  getLastHistoryItem = () => this.props.historyItems[this.props.historyItems.length - 1];

  showCopyDefectModal = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.COPY_DEFECT_FROM_BTN);
    this.props.showModalAction({
      id: 'copySendDefectModal',
      data: {
        lastHistoryItem: this.getLastHistoryItem(),
        itemForCopy: this.getLastWithDefect(),
        isCopy: true,
        fetchFunc: this.props.fetchFunc,
        eventsInfo: {
          okBtn: LOG_PAGE_EVENTS.RECEIVE_BTN_RECEIVE_PREVIOUS_RESULT_MODAL,
          cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_RECEIVE_PREVIOUS_RESULT_MODAL,
        },
      },
    });
  };

  showSendDefectModal = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.SEND_DEFECT_TO_BTN);
    this.props.showModalAction({
      id: 'copySendDefectModal',
      data: {
        lastHistoryItem: this.getLastHistoryItem(),
        itemForCopy: this.props.logItem,
        isCopy: false,
        fetchFunc: this.props.fetchFunc,
        eventsInfo: {
          okBtn: LOG_PAGE_EVENTS.SEND_BTN_SEND_DEFECT_MODAL,
          cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_SEND_DEFECT_MODAL,
        },
      },
    });
  };

  checkIfTheLastItemIsActive = () => this.getLastHistoryItem().id === this.props.logItem.id;

  isCopySendButtonDisabled = () => {
    const lastHistoryItem = this.getLastHistoryItem();
    return (
      !this.props.logItem.issue ||
      this.props.logItem.status === MANY.toUpperCase() ||
      !lastHistoryItem.issue ||
      !this.getLastWithDefect()
    );
  };
  hasRetries = () => {
    const { retries } = this.props;
    return retries.length > 1;
  };
  isDefectTypeVisible = () => {
    const { logItem } = this.props;
    return logItem.issue && logItem.issue.issueType;
  };
  addExtraSpaceTop = () => this.isDefectTypeVisible() && this.hasRetries();

  handleLinkIssue = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.LINK_ISSUE_BTN);
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

    tracking.trackEvent(LOG_PAGE_EVENTS.UNLINK_ISSUE);

    this.props.unlinkIssueAction(items, {
      fetchFunc,
      eventsInfo: {
        unlinkBtn: LOG_PAGE_EVENTS.UNLINK_BTN_UNLINK_ISSUE_MODAL,
        cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_UNLINK_ISSUE_MODAL,
        closeIcon: LOG_PAGE_EVENTS.CLOSE_ICON_UNLINK_ISSUE_MODAL,
      },
    });
  };

  handlePostIssue = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.POST_ISSUE_BTN);
    this.props.postIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
      eventsInfo: POST_BUG_EVENTS_INFO,
    });
  };

  handleEditDefect = () => {
    const { logItem } = this.props;
    if (this.isDefectGroupOperationAvailable()) {
      this.props.showModalAction({
        id: 'editToInvestigateDefectModal',
        data: {
          item: logItem,
          fetchFunc: this.props.fetchFunc,
          eventsInfo: {
            saveBtnDropdown: LOG_PAGE_EVENTS.SAVE_BTN_DROPDOWN_EDIT_ITEM_MODAL,
            postBugBtn: LOG_PAGE_EVENTS.POST_BUG_BTN_EDIT_ITEM_MODAL,
            linkIssueBtn: LOG_PAGE_EVENTS.LOAD_BUG_BTN_EDIT_ITEM_MODAL,
            postBugEvents: POST_BUG_EVENTS_INFO,
            linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
          },
        },
      });
    } else {
      this.props.editDefectsAction([this.props.logItem], {
        fetchFunc: this.props.fetchFunc,
        debugMode: this.props.debugMode,
        eventsInfo: {
          saveBtnDropdown: LOG_PAGE_EVENTS.SAVE_BTN_DROPDOWN_EDIT_ITEM_MODAL,
          postBugBtn: LOG_PAGE_EVENTS.POST_BUG_BTN_EDIT_ITEM_MODAL,
          linkIssueBtn: LOG_PAGE_EVENTS.LOAD_BUG_BTN_EDIT_ITEM_MODAL,
          postBugEvents: POST_BUG_EVENTS_INFO,
          linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
        },
      });
    }
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

  renderRetries = () => {
    const { retryItemId, retries } = this.props;
    return retries.map((item, index) => {
      const selected = item.id === retryItemId;
      const retryNumber = index + 1;
      const updateActiveRetry = () => {
        this.props.tracking.trackEvent(LOG_PAGE_EVENTS.RETRY_CLICK);
        this.props.updateRetryId(item.id);
      };
      return (
        <Retry
          key={item.id}
          retry={item}
          index={retryNumber}
          selected={selected}
          onClick={updateActiveRetry}
        />
      );
    });
  };
  render() {
    const {
      logItem,
      btsIntegrations,
      loading,
      onChangePage,
      onChangeLogLevel,
      onToggleSauceLabsIntegrationView,
      isSauceLabsIntegrationView,
      debugMode,
      intl: { formatMessage },
    } = this.props;

    const isPostIssueUnavailable = !isPostIssueActionAvailable(this.props.btsIntegrations);

    return (
      logItem && (
        <div className={cx('container')}>
          <div className={cx('content')}>
            <div className={cx('description')}>
              {this.isDefectTypeVisible() && (
                <DefectType
                  issue={logItem.issue}
                  onEdit={this.handleEditDefect}
                  onRemove={this.handleUnlinkTicket}
                  editEventInfo={LOG_PAGE_EVENTS.DEFECT_TYPE_TAG}
                  patternTemplates={logItem.patternTemplates}
                />
              )}
            </div>

            {!debugMode && (
              <div className={cx('actions')}>
                <div className={cx('action')}>
                  {this.checkIfTheLastItemIsActive() ? (
                    <GhostButton
                      icon={DownLeftArrowIcon}
                      disabled={this.isCopySendButtonDisabled()}
                      onClick={this.showCopyDefectModal}
                      title={this.getIssueActionTitle(messages.noDefectTypeToCopySendDefect)}
                    >
                      {this.getCopyDefectButtonText()}
                    </GhostButton>
                  ) : (
                    <GhostButton
                      icon={UpRightArrowIcon}
                      disabled={this.isCopySendButtonDisabled()}
                      onClick={this.showSendDefectModal}
                      title={this.getIssueActionTitle(messages.noDefectTypeToCopySendDefect)}
                    >
                      {this.getSendDefectButtonText()}
                    </GhostButton>
                  )}
                </div>
                <div className={cx('action')}>
                  <GhostButton
                    icon={BugIcon}
                    disabled={!logItem.issue || isPostIssueUnavailable}
                    onClick={this.handlePostIssue}
                    title={this.getIssueActionTitle(
                      messages.noDefectTypeToPostIssue,
                      !isPostIssueActionAvailable(btsIntegrations),
                    )}
                  >
                    {formatMessage(messages.postIssue)}
                  </GhostButton>
                </div>
                <div className={cx('action')}>
                  <GhostButton
                    icon={LinkIcon}
                    disabled={!logItem.issue || !btsIntegrations.length}
                    onClick={this.handleLinkIssue}
                    title={this.getIssueActionTitle(
                      messages.noDefectTypeToLinkIssue,
                      !btsIntegrations.length,
                    )}
                  >
                    {formatMessage(messages.linkIssue)}
                  </GhostButton>
                </div>
              </div>
            )}
            {this.hasRetries() && (
              <div
                className={cx('retries', {
                  'extra-space-top': this.addExtraSpaceTop(),
                })}
              >
                <div className={cx('retries-label')}>{formatMessage(messages.retries)}:</div>
                {this.renderRetries()}
              </div>
            )}
          </div>
          <LogItemInfoTabs
            onChangePage={onChangePage}
            onChangeLogLevel={onChangeLogLevel}
            onToggleSauceLabsIntegrationView={onToggleSauceLabsIntegrationView}
            isSauceLabsIntegrationView={isSauceLabsIntegrationView}
            loading={loading}
          />
        </div>
      )
    );
  }
}
