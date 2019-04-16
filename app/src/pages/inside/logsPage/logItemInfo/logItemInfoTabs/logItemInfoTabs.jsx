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
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import StackTraceIcon from 'common/img/stack-trace-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import TestParamsIcon from 'common/img/test-params-icon-inline.svg';
import ClockIcon from 'common/img/clock-inline.svg';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { SauceLabsIntegrationButton } from './sauceLabsIntegrationButton';
import { InfoTabs } from '../infoTabs';
import { LogItemDetails } from './logItemDetails';
import { LogItemActivity } from './logItemActivity';
import { Parameters } from './parameters';
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
  parametersTab: {
    id: 'LogItemInfoTabs.parametersTab',
    defaultMessage: 'Parameters',
  },
  historyTab: {
    id: 'LogItemInfoTabs.historyTab',
    defaultMessage: 'History of actions',
  },
});

@injectIntl
@connect((state) => ({
  lastActivity: lastLogActivitySelector(state),
  activeRetry: activeRetrySelector(state),
  logId: activeLogIdSelector(state),
  retryId: activeRetryIdSelector(state),
  logItem: activeLogSelector(state),
}))
export class LogItemInfoTabs extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    lastActivity: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeLogLevel: PropTypes.func.isRequired,
    onHighlightRow: PropTypes.func.isRequired,
    onToggleThirdPartyIntegrationView: PropTypes.func.isRequired,
    isThirdPartyIntegrationView: PropTypes.bool.isRequired,
    activeRetry: PropTypes.object.isRequired,
    retryId: PropTypes.number.isRequired,
    logId: PropTypes.number.isRequired,
    logItem: PropTypes.object.isRequired,
  };

  static defaultProps = {
    lastActivity: null,
  };

  static getDerivedStateFromProps(props) {
    return props.loading
      ? {
          activeTabId: null,
          activeAttachmentId: null,
        }
      : null;
  }

  state = {
    activeTabId: null,
    activeAttachmentId: null,
  };

  setActiveTab = (activeTabId) => {
    const { isThirdPartyIntegrationView, onToggleThirdPartyIntegrationView } = this.props;
    if (isThirdPartyIntegrationView && activeTabId) {
      onToggleThirdPartyIntegrationView();
    }
    this.setState({
      activeTabId:
        this.state.activeTabId === activeTabId && this.state.activeTabId !== null
          ? null
          : activeTabId,
    });
  };

  changeActiveAttachment = (activeAttachmentId) =>
    this.setState({
      activeAttachmentId,
    });
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
        id: 'attachments',
        label: formatMessage(messages.attachmentsTab),
        icon: AttachmentIcon,
        component: Attachments,
        componentProps: {
          activeItemId: this.state.activeAttachmentId,
          onChangeActiveItem: this.changeActiveAttachment,
        },
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
      {
        id: 'parameters',
        label: formatMessage(messages.parametersTab),
        icon: TestParamsIcon,
        component: Parameters,
        componentProps: {
          logItem: activeRetry,
        },
      },
    ];
    if (this.isHistoryTabVisible()) {
      tabs.push(history);
    }
    return tabs;
  };

  toggleThirdPartyIntegrationContent = () => {
    this.setActiveTab(null);
    this.props.onToggleThirdPartyIntegrationView();
  };

  renderPanelContent = () => {
    const { intl, lastActivity } = this.props;

    return lastActivity ? (
      <div className={cx('panel-content')}>
        <span className={cx('user')}>{lastActivity.userRef}</span>{' '}
        <span className={cx('action')}>{getActionMessage(intl, lastActivity)}</span>
      </div>
    ) : null;
  };

  renderThirdPartyIntegrationButton = () => {
    const { logItem, isThirdPartyIntegrationView } = this.props;
    const isThirdPartyIntegrationExists = !!getSauceLabsConfig(logItem.attributes);
    return isThirdPartyIntegrationExists ? (
      <SauceLabsIntegrationButton
        active={isThirdPartyIntegrationView}
        onClick={this.toggleThirdPartyIntegrationContent}
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
        thirdPartyIntegrationControl={this.renderThirdPartyIntegrationButton()}
      />
    );
  }
}
