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
import { SERVER_SETTINGS_TAB_PAGE, settingsTabSelector } from 'controllers/pages';
import { AUTHORIZATION_CONFIGURATION, ANALYTICS } from 'common/constants/settingsTabs';
import { NavigationTabs } from 'components/main/navigationTabs';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { AuthConfigurationTab } from './authConfigurationTab';
import { AnalyticsTab } from './analyticsTab';

const messages = defineMessages({
  authConfiguration: {
    id: 'ServerSettingsTabs.authConfiguration',
    defaultMessage: 'Authorization configuration',
  },
  statistics: {
    id: 'ServerSettingsTabs.analytics',
    defaultMessage: 'Analytics',
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
    intl: PropTypes.object.isRequired,
    activeTab: PropTypes.string,
    onChangeTab: PropTypes.func,
  };
  static defaultProps = {
    activeTab: AUTHORIZATION_CONFIGURATION,
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
      eventInfo: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.AUTHORIZATION_CONFIGURATION_TAB,
    },
    [ANALYTICS]: {
      name: this.props.intl.formatMessage(messages.statistics),
      link: this.createTabLink(ANALYTICS),
      component: <AnalyticsTab />,
      mobileDisabled: true,
      eventInfo: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.ANALYTICS_TAB,
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
