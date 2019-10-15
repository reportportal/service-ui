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

  getCopySendDefectButtonText = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (this.checkIfTheLastItemIsActive()) {
      const lastItemWithDefect = this.getLastWithDefect();
      return formatMessage(messages.copyDefect, {
        prefix: lastItemWithDefect ? formatMessage(messages.fromPrefix) : '',
        message: lastItemWithDefect ? `#${lastItemWithDefect.launchNumber}` : '',
      });
    }
    const lastHistoryItem = this.getLastHistoryItem();
    return formatMessage(messages.sendDefect, {
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

  showCopySendDefectModal = () => {
    this.props.showModalAction({
      id: 'copySendDefectModal',
      data: {
        lastHistoryItem: this.getLastHistoryItem(),
        itemForCopy: this.checkIfTheLastItemIsActive()
          ? this.getLastWithDefect()
          : this.props.logItem,
        isCopy: this.checkIfTheLastItemIsActive(),
        fetchFunc: this.props.fetchFunc,
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
      eventsInfo: {
        loadBtn: LOG_PAGE_EVENTS.LOAD_BTN_LINK_ISSUE_MODAL,
        cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_LINK_ISSUE_MODAL,
        addNewIssue: LOG_PAGE_EVENTS.ADD_NEW_ISSUE_LINK_ISSUE_MODAL,
        closeIcon: LOG_PAGE_EVENTS.CLOSE_ICON_LINK_ISSUE_MODAL,
      },
    });
  };

  handleUnlinkTicket = (ticketId) => {
    const { logItem, fetchFunc } = this.props;
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

    this.props.unlinkIssueAction(items, { fetchFunc });
  };

  handlePostIssue = () => {
    this.props.tracking.trackEvent(LOG_PAGE_EVENTS.POST_ISSUE_BTN);
    this.props.postIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
      eventsInfo: {
        postBtn: LOG_PAGE_EVENTS.POST_BTN_POST_ISSUE_MODAL,
        attachmentsSwitcher: LOG_PAGE_EVENTS.ATTACHMENTS_SWITCHER_POST_ISSUE_MODAL,
        logsSwitcher: LOG_PAGE_EVENTS.LOGS_SWITCHER_POST_ISSUE_MODAL,
        commentSwitcher: LOG_PAGE_EVENTS.COMMENT_SWITCHER_POST_ISSUE_MODAL,
        cancelBtn: LOG_PAGE_EVENTS.CANCEL_BTN_POST_ISSUE_MODAL,
        closeIcon: LOG_PAGE_EVENTS.CLOSE_ICON_POST_ISSUE_MODAL,
      },
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
      const updateActiveRetry = () => this.props.updateRetryId(item.id);
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
                  <GhostButton
                    icon={this.checkIfTheLastItemIsActive() ? DownLeftArrowIcon : UpRightArrowIcon}
                    disabled={this.isCopySendButtonDisabled()}
                    onClick={this.showCopySendDefectModal}
                    title={this.getIssueActionTitle(messages.noDefectTypeToCopySendDefect)}
                  >
                    {this.getCopySendDefectButtonText()}
                  </GhostButton>
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
