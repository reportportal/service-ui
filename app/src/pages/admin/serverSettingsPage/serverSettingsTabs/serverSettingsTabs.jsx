import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect } from 'redux-first-router';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { SERVER_SETTINGS_TAB_PAGE } from 'controllers/pages';
import {
  EMAIL_SERVER,
  AUTHORIZATION_CONFIGURATION,
  STATISTICS,
} from 'common/constants/settingsTabs';
import { NavigationTabs } from 'components/main/navigationTabs';

const messages = defineMessages({
  eMailServer: {
    id: 'ServerSettingsTabs.eMailServer',
    defaultMessage: 'E-mail server',
  },
  authConfiguration: {
    id: 'ServerSettingsTabs.authConfiguration',
    defaultMessage: 'Authorization configuration',
  },
  statistics: {
    id: 'ServerSettingsTabs.statistics',
    defaultMessage: 'Statistics',
  },
});

@connect(
  (state) => ({
    activeTab: state.location.payload.settingTab,
  }),
  {
    changeTab: (link) => redirect(link),
  },
)
@injectIntl
export class ServerSettingsTabs extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeTab: PropTypes.string,
    changeTab: PropTypes.func,
  };
  static defaultProps = {
    activeTab: EMAIL_SERVER,
    changeTab: () => {},
  };

  createTabLink = (tabName) => ({
    type: SERVER_SETTINGS_TAB_PAGE,
    payload: { settingTab: tabName },
  });

  createTabsConfig = () => ({
    [EMAIL_SERVER]: {
      name: this.props.intl.formatMessage(messages.eMailServer),
      link: this.createTabLink(EMAIL_SERVER),
      component: <div>E-mail server</div>,
    },
    [AUTHORIZATION_CONFIGURATION]: {
      name: this.props.intl.formatMessage(messages.authConfiguration),
      link: this.createTabLink(AUTHORIZATION_CONFIGURATION),
      component: <div>Authorization configuration</div>,
    },
    [STATISTICS]: {
      name: this.props.intl.formatMessage(messages.statistics),
      link: this.createTabLink(STATISTICS),
      component: <div>Statistics</div>,
    },
  });

  render = () => (
    <NavigationTabs
      config={this.createTabsConfig()}
      activeTab={this.props.activeTab}
      onChangeTab={this.props.changeTab}
    />
  );
}
