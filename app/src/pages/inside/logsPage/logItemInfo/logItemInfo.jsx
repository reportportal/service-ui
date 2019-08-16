import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { DefectType } from 'pages/inside/stepPage/stepGrid/defectType';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
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
  noBugTrackingSystemToLinkIssue: {
    id: 'LogItemInfo.noBugTrackingSystemToLinkIssue',
    defaultMessage: 'Configure bug tracking system to link issue',
  },
  noDefectTypeToLinkIssue: {
    id: 'LogItemInfo.noDefectTypeToLinkIssue',
    defaultMessage: "You can't link issue if item has no defect type",
  },
  noBugTrackingSystemToPostIssue: {
    id: 'LogItemInfo.noBugTrackingSystemToPostIssue',
    defaultMessage: 'Configure bug tracking system to post issue',
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
    onHighlightRow: PropTypes.func.isRequired,
    onToggleSauceLabsIntegrationView: PropTypes.func.isRequired,
    isSauceLabsIntegrationView: PropTypes.bool.isRequired,
    debugMode: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
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

  getLinkIssueTitle = () => {
    const {
      logItem,
      btsIntegrations,
      intl: { formatMessage },
    } = this.props;
    let title = '';

    if (!logItem.issue) {
      title = formatMessage(messages.noDefectTypeToLinkIssue);
    } else if (!btsIntegrations.length) {
      title = formatMessage(messages.noBugTrackingSystemToLinkIssue);
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
    this.props.linkIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
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
    this.props.postIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
    });
  };

  handleEditDefect = () => {
    const { logItem } = this.props;
    if (this.isDefectGroupOperationAvailable()) {
      this.props.showModalAction({
        id: 'editToInvestigateDefectModal',
        data: { item: logItem, fetchFunc: this.props.fetchFunc },
      });
    } else {
      this.props.editDefectsAction([this.props.logItem], {
        fetchFunc: this.props.fetchFunc,
        debugMode: this.props.debugMode,
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
      onHighlightRow,
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
                  >
                    {this.getCopySendDefectButtonText()}
                  </GhostButton>
                </div>
                <div className={cx('action')}>
                  <GhostButton
                    icon={BugIcon}
                    disabled={!logItem.issue || isPostIssueUnavailable}
                    onClick={this.handlePostIssue}
                    title={
                      (isPostIssueUnavailable &&
                        this.props.intl.formatMessage(messages.noBugTrackingSystemToPostIssue)) ||
                      ''
                    }
                  >
                    {formatMessage(messages.postIssue)}
                  </GhostButton>
                </div>
                <div className={cx('action')}>
                  <GhostButton
                    icon={LinkIcon}
                    disabled={!logItem.issue || !btsIntegrations.length}
                    onClick={this.handleLinkIssue}
                    title={this.getLinkIssueTitle()}
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
            onHighlightRow={onHighlightRow}
            onToggleSauceLabsIntegrationView={onToggleSauceLabsIntegrationView}
            isSauceLabsIntegrationView={isSauceLabsIntegrationView}
            loading={loading}
          />
        </div>
      )
    );
  }
}
