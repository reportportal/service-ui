import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import {
  lastLogActivitySelector,
  activeRetrySelector,
  activeLogIdSelector,
  activeRetryIdSelector,
  activeLogSelector,
} from 'controllers/log';
import { fetchFirstAttachmentsAction, attachmentItemsSelector } from 'controllers/log/attachments';
import { SAUCE_LABS } from 'common/constants/integrationNames';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import StackTraceIcon from 'common/img/stack-trace-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import ClockIcon from 'common/img/clock-inline.svg';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { availableIntegrationsByPluginNameSelector } from 'controllers/plugins';
import { SauceLabsIntegrationButton } from './sauceLabsIntegrationButton';
import { InfoTabs } from '../infoTabs';
import { LogItemDetails } from './logItemDetails';
import { LogItemActivity } from './logItemActivity';
import { Attachments } from './attachments';
import { StackTrace } from './stackTrace';
import { getActionMessage } from '../utils/getActionMessage';
import styles from './logItemInfoTabs.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  stackTab: {
    id: 'LogItemInfoTabs.stackTab',
    defaultMessage: 'Stack trace',
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
  }),
  {
    fetchFirstAttachments: fetchFirstAttachmentsAction,
  },
)
export class LogItemInfoTabs extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    lastActivity: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeLogLevel: PropTypes.func.isRequired,
    onHighlightRow: PropTypes.func.isRequired,
    activeRetry: PropTypes.object.isRequired,
    retryId: PropTypes.number.isRequired,
    logId: PropTypes.number.isRequired,
    logItem: PropTypes.object.isRequired,
    onToggleSauceLabsIntegrationView: PropTypes.func.isRequired,
    isSauceLabsIntegrationView: PropTypes.bool.isRequired,
    sauceLabsIntegrations: PropTypes.array.isRequired,
    fetchFirstAttachments: PropTypes.func,
    attachments: PropTypes.array,
  };

  static defaultProps = {
    lastActivity: null,
    fetchFirstAttachments: () => {},
    attachments: [],
  };

  static getDerivedStateFromProps(props) {
    return props.loading
      ? {
          activeTabId: null,
        }
      : null;
  }

  state = {
    activeTabId: null,
  };

  componentDidUpdate() {
    if (this.props.loading && this.props.isSauceLabsIntegrationView) {
      this.props.onToggleSauceLabsIntegrationView();
    }
  }

  componentWillUnmount() {
    if (this.props.isSauceLabsIntegrationView) {
      this.props.onToggleSauceLabsIntegrationView();
    }
  }

  setActiveTab = (activeTabId) => {
    const {
      isSauceLabsIntegrationView,
      onToggleSauceLabsIntegrationView,
      fetchFirstAttachments,
      attachments,
    } = this.props;
    if (isSauceLabsIntegrationView && activeTabId) {
      onToggleSauceLabsIntegrationView();
    }
    if (activeTabId === ATTACHMENTS_TAB_ID && !attachments.length) {
      fetchFirstAttachments();
    }
    this.setState({
      activeTabId:
        this.state.activeTabId === activeTabId && this.state.activeTabId !== null
          ? null
          : activeTabId,
    });
  };

  isHistoryTabVisible = () => {
    const { retryId, logId } = this.props;
    return retryId === logId;
  };
  makeTabs = () => {
    const {
      intl: { formatMessage },
      onChangePage,
      onChangeLogLevel,
      onHighlightRow,
      activeRetry,
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
          onHighlightRow,
          onChangePage,
          onChangeLogLevel,
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
    this.setActiveTab(null);
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

  render() {
    return (
      <InfoTabs
        tabs={this.makeTabs()}
        activeTabId={this.state.activeTabId}
        setActiveTab={this.setActiveTab}
        panelContent={this.renderPanelContent()}
        thirdPartyIntegrationControl={this.renderSauceLabsIntegrationButton()}
      />
    );
  }
}
