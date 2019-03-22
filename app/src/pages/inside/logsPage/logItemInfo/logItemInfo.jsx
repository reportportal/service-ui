import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { DefectType } from 'pages/inside/stepPage/stepGrid/defectType';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { linkIssueAction, editDefectsAction } from 'controllers/step';
import { showModalAction } from 'controllers/modal';
import { activeLogSelector, historyItemsSelector } from 'controllers/log';
import { PASSED, SKIPPED, MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import { externalSystemSelector } from 'controllers/project';
import LinkIcon from 'common/img/link-inline.svg';
import DownLeftArrowIcon from 'common/img/down-left-arrow-inline.svg';
import UpRightArrowIcon from 'common/img/up-right-arrow-inline.svg';
import BugIcon from 'common/img/bug-inline.svg';
import { LogItemInfoTabs } from './logItemInfoTabs';
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
});

@connect(
  (state) => ({
    logItem: activeLogSelector(state),
    historyItems: historyItemsSelector(state),
    externalSystems: externalSystemSelector(state),
  }),
  {
    linkIssueAction,
    editDefectsAction,
    showModalAction,
  },
)
@injectIntl
export class LogItemInfo extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeLogLevel: PropTypes.func.isRequired,
    editDefectsAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func.isRequired,
    historyItems: PropTypes.array.isRequired,
    externalSystems: PropTypes.array.isRequired,
    fetchFunc: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    onHighlightRow: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    logItem: PropTypes.object,
  };
  static defaultProps = {
    logItem: null,
  };

  getLinkIssueTitle = () => {
    const {
      logItem,
      externalSystems,
      intl: { formatMessage },
    } = this.props;
    let title = '';

    if (!logItem.issue) {
      title = formatMessage(messages.noDefectTypeToLinkIssue);
    } else if (!externalSystems.length) {
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

    return reversedHistoryItems.find(
      (item) =>
        item.status !== PASSED.toUpperCase() &&
        item.status !== SKIPPED.toUpperCase() &&
        item.status !== NOT_FOUND.toUpperCase() &&
        item.status !== MANY.toUpperCase(),
    );
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
      this.props.logItem.status === SKIPPED.toUpperCase() ||
      this.props.logItem.status === PASSED.toUpperCase() ||
      lastHistoryItem.status === PASSED.toUpperCase() ||
      lastHistoryItem.status === SKIPPED.toUpperCase() ||
      !this.getLastWithDefect()
    );
  };

  handleLinkIssue = () => {
    this.props.linkIssueAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
    });
  };

  handleEditDefect = () => {
    this.props.editDefectsAction([this.props.logItem], {
      fetchFunc: this.props.fetchFunc,
    });
  };

  render() {
    const {
      logItem,
      loading,
      onChangePage,
      onChangeLogLevel,
      onHighlightRow,
      intl: { formatMessage },
    } = this.props;

    return (
      logItem && (
        <div className={cx('container')}>
          <div className={cx('content')}>
            <div className={cx('description')}>
              {logItem.issue &&
                logItem.issue.issueType && (
                  <DefectType
                    issue={logItem.issue}
                    onEdit={this.handleEditDefect}
                    editEventInfo={LOG_PAGE_EVENTS.DEFECT_TYPE_TAG}
                  />
                )}
            </div>
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
                <GhostButton icon={BugIcon} disabled>
                  {formatMessage(messages.postIssue)}
                </GhostButton>
              </div>
              <div className={cx('action')}>
                <GhostButton
                  onClick={this.handleLinkIssue}
                  icon={LinkIcon}
                  disabled={!logItem.issue || !this.props.externalSystems.length}
                  title={this.getLinkIssueTitle()}
                >
                  {formatMessage(messages.linkIssue)}
                </GhostButton>
              </div>
            </div>
          </div>
          <LogItemInfoTabs
            logItem={logItem}
            onChangePage={onChangePage}
            onChangeLogLevel={onChangeLogLevel}
            onHighlightRow={onHighlightRow}
            loading={loading}
          />
        </div>
      )
    );
  }
}
