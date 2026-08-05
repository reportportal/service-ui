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
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { ExtensionLoader } from 'components/extensionLoader';
import {
  lastLogActivitySelector,
  activeRetrySelector,
  activeLogIdSelector,
  activeRetryIdSelector,
  activeLogSelector,
  activeTabIdSelector,
  setActiveTabIdAction,
  LOG_MESSAGE_FILTER_KEY,
  MOBITRU_JUMP_LOG_INFO_KEY,
  NAMESPACE,
} from 'controllers/log';
import { querySelector } from 'controllers/log/selectors';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { noLogsCollapsingSelector } from 'controllers/user';
import { projectKeySelector } from 'controllers/project';
import { fetchFirstAttachmentsAction, attachmentItemsSelector } from 'controllers/log/attachments';
import { fetch } from 'common/utils/fetch';
import { setStorageItem } from 'common/utils';
import { SAUCE_LABS } from 'common/constants/pluginNames';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import StackTraceIcon from 'common/img/stack-trace-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import ClockIcon from 'common/img/clock-inline.svg';
import LogIcon from 'common/img/log-view-inline.svg';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { availableIntegrationsByPluginNameSelector } from 'controllers/plugins';
import { uiExtensionLogTabSelector } from 'controllers/plugins/uiExtensions';
import { StackTrace } from 'pages/inside/common/stackTrace';
import { SauceLabsIntegrationButton } from './sauceLabsIntegrationButton';
import { InfoTabs } from '../infoTabs';
import { LogItemDetails } from './logItemDetails';
import { LogItemActivity } from './logItemActivity';
import { Attachments } from './attachments';
import { getActionMessage } from '../utils/getActionMessage';
import styles from './logItemInfoTabs.scss';
import { LogsGridWrapper } from '../../logsGridWrapper';
import {
  checkMobitruLogTabVisibility,
  isMobitruVideoSubtreeTab,
} from './utils/checkMobitruLogTabVisibility';
import { resolveMobitruLogForJump } from './utils/resolveMobitruLogForJump';

const cx = classNames.bind(styles);

const messages = defineMessages({
  stackTab: {
    id: 'LogItemInfoTabs.stackTab',
    defaultMessage: 'Stack trace',
  },
  logsTab: {
    id: 'LogItemInfoTabs.logsTab',
    defaultMessage: 'All logs',
  },
  attachmentsTab: {
    id: 'LogItemInfoTabs.attachmentsTab',
    defaultMessage: 'Attachments',
  },
  detailsTab: {
    id: 'LogItemInfoTabs.detailsTab',
    defaultMessage: 'Item details',
  },
  historyTab: {
    id: 'LogItemInfoTabs.historyTab',
    defaultMessage: 'History of actions',
  },
  jumpToLogFailed: {
    id: 'LogItemInfoTabs.jumpToLogFailed',
    defaultMessage: 'Target log could not be found',
  },
});

const ATTACHMENTS_TAB_ID = 'attachments';

const LOG_TAB_ELEMENT_EVENTS = {
  remote_device: LOG_PAGE_EVENTS.REMOTE_DEVICE_TAB,
};

@injectIntl
@connect(
  (state) => ({
    lastActivity: lastLogActivitySelector(state),
    activeRetry: activeRetrySelector(state),
    logId: activeLogIdSelector(state),
    retryId: activeRetryIdSelector(state),
    logItem: activeLogSelector(state),
    sauceLabsIntegrations: availableIntegrationsByPluginNameSelector(state, SAUCE_LABS),
    attachments: attachmentItemsSelector(state),
    activeTabId: activeTabIdSelector(state),
    noLogsCollapsing: noLogsCollapsingSelector(state),
    logTabExtensions: uiExtensionLogTabSelector(state),
    projectKey: projectKeySelector(state),
    logQuery: querySelector(state, NAMESPACE),
  }),
  {
    fetchFirstAttachments: fetchFirstAttachmentsAction,
    setActiveTabId: setActiveTabIdAction,
    showNotification,
  },
)
@track()
export class LogItemInfoTabs extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    lastActivity: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    activeRetry: PropTypes.object.isRequired,
    retryId: PropTypes.number.isRequired,
    logId: PropTypes.number.isRequired,
    logItem: PropTypes.object.isRequired,
    onToggleSauceLabsIntegrationView: PropTypes.func.isRequired,
    isSauceLabsIntegrationView: PropTypes.bool.isRequired,
    sauceLabsIntegrations: PropTypes.array.isRequired,
    fetchFirstAttachments: PropTypes.func,
    setActiveTabId: PropTypes.func,
    attachments: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    activeTabId: PropTypes.string,
    noLogsCollapsing: PropTypes.bool,
    logTabExtensions: PropTypes.array,
    projectKey: PropTypes.string,
    logQuery: PropTypes.object,
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    lastActivity: null,
    fetchFirstAttachments: () => {},
    attachments: [],
    activeTabId: 'logs',
    setActiveTabId: () => {},
    noLogsCollapsing: false,
    logTabExtensions: [],
    projectKey: '',
    logQuery: {},
    showNotification: () => {},
  };

  state = {
    activeTabId: null,
    logTabVisibility: {},
  };

  logTabVisibilityRequestId = 0;

  static getDerivedStateFromProps(props) {
    return props.loading
      ? {
          activeTabId: null,
        }
      : null;
  }

  componentDidMount() {
    const { activeTabId, fetchFirstAttachments } = this.props;
    if (activeTabId === ATTACHMENTS_TAB_ID) {
      fetchFirstAttachments();
    }
    this.fetchLogTabVisibility();
  }

  componentDidUpdate(prevProps) {
    const {
      activeTabId,
      fetchFirstAttachments,
      isSauceLabsIntegrationView,
      loading,
      logId,
      retryId,
      activeRetry,
      projectKey,
      logTabExtensions,
    } = this.props;
    if (loading && isSauceLabsIntegrationView) {
      this.props.onToggleSauceLabsIntegrationView();
    }
    if (prevProps.logId !== logId && activeTabId === ATTACHMENTS_TAB_ID) {
      fetchFirstAttachments();
    }
    if (
      prevProps.retryId !== retryId ||
      prevProps.logId !== logId ||
      prevProps.activeRetry?.path !== activeRetry?.path ||
      prevProps.projectKey !== projectKey ||
      prevProps.logTabExtensions !== logTabExtensions
    ) {
      this.fetchLogTabVisibility();
    }
  }

  getLogTabId = (extension) => `log-tab:${extension.pluginName}:${extension.name}`;

  fetchLogTabVisibility = () => {
    const { activeRetry, projectKey, logId, retryId, logTabExtensions } = this.props;
    const mobitruExtensions = logTabExtensions.filter(isMobitruVideoSubtreeTab);

    this.logTabVisibilityRequestId += 1;

    if (!mobitruExtensions.length || !activeRetry?.path || !projectKey) {
      return;
    }

    const requestId = this.logTabVisibilityRequestId;
    const excludedRetryParentId = logId === retryId ? retryId : undefined;
    const loadingState = mobitruExtensions.reduce(
      (acc, extension) => ({
        ...acc,
        [this.getLogTabId(extension)]: 'loading',
      }),
      {},
    );

    this.setState((prevState) => ({
      logTabVisibility: {
        ...prevState.logTabVisibility,
        ...loadingState,
      },
    }));

    mobitruExtensions.forEach((extension) => {
      const tabId = this.getLogTabId(extension);

      checkMobitruLogTabVisibility({
        fetchFn: fetch,
        projectKey,
        activeRetryPath: activeRetry.path,
        excludedRetryParentId,
      })
        .then((isVisible) => {
          if (requestId !== this.logTabVisibilityRequestId) {
            return;
          }

          this.setState((prevState) => ({
            logTabVisibility: {
              ...prevState.logTabVisibility,
              [tabId]: isVisible,
            },
          }));

          if (!isVisible && this.props.activeTabId === tabId) {
            this.props.setActiveTabId('logs');
          }
        })
        .catch(() => {
          if (requestId !== this.logTabVisibilityRequestId) {
            return;
          }

          this.setState((prevState) => ({
            logTabVisibility: {
              ...prevState.logTabVisibility,
              [tabId]: false,
            },
          }));

          if (this.props.activeTabId === tabId) {
            this.props.setActiveTabId('logs');
          }
        });
    });
  };

  isLogTabVisible = (extension) => {
    if (isMobitruVideoSubtreeTab(extension)) {
      const tabId = this.getLogTabId(extension);
      return this.state.logTabVisibility[tabId] === true;
    }

    if (extension.payload?.visibilityAttributeKey) {
      const { logItem } = this.props;
      return logItem.attributes?.some(
        (attr) => attr.key === extension.payload.visibilityAttributeKey,
      );
    }

    return true;
  };

  componentWillUnmount() {
    this.logTabVisibilityRequestId += 1;

    if (this.props.isSauceLabsIntegrationView) {
      this.props.onToggleSauceLabsIntegrationView();
    }
  }

  setActiveTab = (tabId) => {
    const {
      isSauceLabsIntegrationView,
      onToggleSauceLabsIntegrationView,
      fetchFirstAttachments,
      attachments,
      setActiveTabId,
    } = this.props;
    if (isSauceLabsIntegrationView && tabId) {
      onToggleSauceLabsIntegrationView();
    }
    if (tabId === ATTACHMENTS_TAB_ID && !attachments.length) {
      fetchFirstAttachments();
    }
    setActiveTabId(tabId);
  };

  isHistoryTabVisible = () => {
    const { retryId, logId } = this.props;
    return retryId === logId;
  };

  handleJumpToMobitruLog = async (logId, itemId) => {
    const {
      projectKey,
      retryId,
      logQuery,
      setActiveTabId,
      showNotification: showNotificationAction,
      intl: { formatMessage },
      tracking,
    } = this.props;

    tracking.trackEvent(LOG_PAGE_EVENTS.clickJumpToLog('remote_device'));

    try {
      const logInfo = await resolveMobitruLogForJump({
        fetchFn: fetch,
        projectKey,
        retryId,
        itemId,
        logId,
        logQuery,
      });

      if (!logInfo?.pagesLocation?.length) {
        showNotificationAction({
          message: formatMessage(messages.jumpToLogFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
        return;
      }

      setStorageItem(MOBITRU_JUMP_LOG_INFO_KEY, {
        logInfo,
        logId,
        shouldClearSearchFilter: Boolean(logQuery[LOG_MESSAGE_FILTER_KEY]),
      });
      setActiveTabId('logs');
    } catch {
      showNotificationAction({
        message: formatMessage(messages.jumpToLogFailed),
        type: NOTIFICATION_TYPES.ERROR,
      });
    }
  };

  makeTabs = () => {
    const {
      intl: { formatMessage },
      activeRetry,
      logItem,
      noLogsCollapsing,
      logTabExtensions,
      logId,
      retryId,
    } = this.props;
    const history = {
      id: 'history',
      label: formatMessage(messages.historyTab),
      icon: ClockIcon,
      component: LogItemActivity,
      componentProps: {},
      eventInfo: LOG_PAGE_EVENTS.ACTIONS_TAB,
    };
    const tabs = [
      {
        id: 'stack',
        label: formatMessage(messages.stackTab),
        icon: StackTraceIcon,
        eventInfo: LOG_PAGE_EVENTS.STACK_TRACE_TAB,
        component: StackTrace,
        componentProps: {
          logItem,
          expanded: noLogsCollapsing,
          eventsInfo: {
            onOpenStackTraceEvent: () => LOG_PAGE_EVENTS.EXPAND_STACK_TRACE,
          },
        },
      },
      {
        id: 'logs',
        label: formatMessage(messages.logsTab),
        icon: LogIcon,
        stroked: true,
        eventInfo: LOG_PAGE_EVENTS.LOGS_TAB,
        component: LogsGridWrapper,
        componentProps: {
          logItem,
          isSauceLabsIntegrationView: this.props.isSauceLabsIntegrationView,
        },
      },
      {
        id: ATTACHMENTS_TAB_ID,
        label: formatMessage(messages.attachmentsTab),
        icon: AttachmentIcon,
        component: Attachments,
        eventInfo: LOG_PAGE_EVENTS.ATTACHMENT_TAB,
      },
      {
        id: 'details',
        label: formatMessage(messages.detailsTab),
        icon: InfoIcon,
        component: LogItemDetails,
        componentProps: {
          logItem: activeRetry,
        },
        eventInfo: LOG_PAGE_EVENTS.ITEM_DETAILS_TAB,
      },
    ];
    if (this.isHistoryTabVisible()) {
      tabs.push(history);
    }

    logTabExtensions.forEach((extension) => {
      if (!this.isLogTabVisible(extension)) {
        return;
      }

      const tabId = this.getLogTabId(extension);
      const tabElementName = extension.payload?.tabElementName;
      const excludedRetryParentId = logId === retryId ? retryId : undefined;
      const isMobitruTab = isMobitruVideoSubtreeTab(extension);
      tabs.push({
        id: tabId,
        label: extension.name,
        icon: extension.payload.icon,
        eventInfo: LOG_TAB_ELEMENT_EVENTS[tabElementName],
        component: ExtensionLoader,
        componentProps: {
          extension,
          logItem,
          activeRetry,
          excludedRetryParentId,
          ...(isMobitruTab && { onJumpToLog: this.handleJumpToMobitruLog }),
        },
      });
    });

    return tabs;
  };

  toggleSauceLabsIntegrationContent = () => {
    // TODO: Handle SauceLabs integration as independent tab
    this.props.setActiveTabId('logs');
    this.props.onToggleSauceLabsIntegrationView();
  };

  renderPanelContent = () => {
    const { intl, lastActivity } = this.props;

    return lastActivity ? (
      <div className={cx('panel-content')}>
        <span className={cx('user')}>{lastActivity.user}</span>{' '}
        <span className={cx('action')}>{getActionMessage(intl, lastActivity)}</span>
      </div>
    ) : null;
  };

  renderSauceLabsIntegrationButton = () => {
    const { logItem, isSauceLabsIntegrationView, sauceLabsIntegrations } = this.props;
    const isThirdPartyIntegrationExists =
      !!getSauceLabsConfig(logItem.attributes) && sauceLabsIntegrations.length;
    return isThirdPartyIntegrationExists ? (
      <SauceLabsIntegrationButton
        active={isSauceLabsIntegrationView}
        onClick={this.toggleSauceLabsIntegrationContent}
      />
    ) : null;
  };

  getActiveTabId = (tabs) => {
    const { activeTabId } = this.props;
    if (tabs.find((tab) => tab.id === activeTabId)) {
      return activeTabId;
    }
    // Previously selected tab may be gone after step navigation (e.g. Remote device
    // missing on the next nested step). Fall back to All Logs so content is shown.
    if (tabs.find((tab) => tab.id === 'logs')) {
      return 'logs';
    }
    return tabs[0]?.id ?? null;
  };

  render() {
    const tabs = this.makeTabs();
    const activeTabId = this.getActiveTabId(tabs);

    return (
      <InfoTabs
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTab={this.setActiveTab}
        panelContent={this.renderPanelContent()}
        thirdPartyIntegrationControl={this.renderSauceLabsIntegrationButton()}
      />
    );
  }
}
