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
import {
  lastLogActivitySelector,
  activeRetrySelector,
  activeLogIdSelector,
  activeRetryIdSelector,
  activeLogSelector,
  activeTabIdSelector,
  setActiveTabIdAction,
} from 'controllers/log';
import { fetchFirstAttachmentsAction, attachmentItemsSelector } from 'controllers/log/attachments';
import { SAUCE_LABS } from 'common/constants/pluginNames';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import StackTraceIcon from 'common/img/stack-trace-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import ClockIcon from 'common/img/clock-inline.svg';
import LogIcon from 'common/img/log-view-inline.svg';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { availableIntegrationsByPluginNameSelector } from 'controllers/plugins';
import { StackTrace } from 'pages/inside/common/stackTrace';
import { SauceLabsIntegrationButton } from './sauceLabsIntegrationButton';
import { InfoTabs } from '../infoTabs';
import { LogItemDetails } from './logItemDetails';
import { LogItemActivity } from './logItemActivity';
import { Attachments } from './attachments';
import { getActionMessage } from '../utils/getActionMessage';
import styles from './logItemInfoTabs.scss';
import { LogsGridWrapper } from '../../logsGridWrapper';

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
});

const ATTACHMENTS_TAB_ID = 'attachments';

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
  }),
  {
    fetchFirstAttachments: fetchFirstAttachmentsAction,
    setActiveTabId: setActiveTabIdAction,
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
  };

  static defaultProps = {
    lastActivity: null,
    fetchFirstAttachments: () => {},
    attachments: [],
    activeTabId: 'logs',
    setActiveTabId: () => {},
  };

  state = {
    activeTabId: null,
  };

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
  }

  componentDidUpdate(prevProps) {
    const {
      activeTabId,
      fetchFirstAttachments,
      isSauceLabsIntegrationView,
      loading,
      logId,
    } = this.props;
    if (loading && isSauceLabsIntegrationView) {
      this.props.onToggleSauceLabsIntegrationView();
    }
    if (prevProps.logId !== logId && activeTabId === ATTACHMENTS_TAB_ID) {
      fetchFirstAttachments();
    }
  }

  componentWillUnmount() {
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
  makeTabs = () => {
    const {
      intl: { formatMessage },
      activeRetry,
      logItem,
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
    return null;
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
