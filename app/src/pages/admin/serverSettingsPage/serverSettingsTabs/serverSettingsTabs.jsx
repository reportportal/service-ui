import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { SERVER_SETTINGS_TAB_PAGE, settingsTabSelector } from 'controllers/pages';
import {
  EMAIL_SERVER,
  AUTHORIZATION_CONFIGURATION,
  STATISTICS,
} from 'common/constants/settingsTabs';
import { NavigationTabs } from 'components/main/navigationTabs';
import { AuthConfigurationTab } from './authConfigurationTab';
import { StatisticsTab } from './statisticsTab';

const messages = defineMessages({
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
    activeTab: settingsTabSelector(state),
  }),
  {
    onChangeTab: (linkAction) => linkAction,
  },
)
@injectIntl
export class ServerSettingsTabs extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeTab: PropTypes.string,
    onChangeTab: PropTypes.func,
  };
  static defaultProps = {
    activeTab: EMAIL_SERVER,
    onChangeTab: () => {},
  };

  createTabLink = (tabName) => ({
    type: SERVER_SETTINGS_TAB_PAGE,
    payload: { settingsTab: tabName },
  });

  createTabsConfig = () => ({
    [AUTHORIZATION_CONFIGURATION]: {
      name: this.props.intl.formatMessage(messages.authConfiguration),
      link: this.createTabLink(AUTHORIZATION_CONFIGURATION),
      component: <AuthConfigurationTab />,
      mobileDisabled: true,
    },
    [STATISTICS]: {
      name: this.props.intl.formatMessage(messages.statistics),
      link: this.createTabLink(STATISTICS),
      component: <StatisticsTab />,
      mobileDisabled: true,
    },
  });

  render = () => (
    <NavigationTabs
      config={this.createTabsConfig()}
      activeTab={this.props.activeTab}
      onChangeTab={this.props.onChangeTab}
      mobileDisabled
    />
  );
}
