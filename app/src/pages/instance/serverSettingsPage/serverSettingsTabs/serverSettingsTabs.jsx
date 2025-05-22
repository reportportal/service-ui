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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { SERVER_SETTINGS_TAB_PAGE, settingsTabSelector } from 'controllers/pages';
import {
  AUTHORIZATION_CONFIGURATION,
  ANALYTICS,
  LINKS_AND_BRANDING,
} from 'common/constants/settingsTabs';
import { NavigationTabs } from 'components/main/navigationTabs';
import {
  getServerSettingsPageViewEvent,
  ADMIN_SERVER_SETTINGS_PAGE_EVENTS,
} from 'components/main/analytics/events/adminServerSettingsPageEvents';
import { AuthConfigurationTab } from './authConfigurationTab';
import { AnalyticsTab } from './analyticsTab';
import { LinksAndBrandingTab } from './linksAndBrandingTab';

const messages = defineMessages({
  authConfiguration: {
    id: 'ServerSettingsTabs.authConfiguration',
    defaultMessage: 'Authorization configuration',
  },
  statistics: {
    id: 'ServerSettingsTabs.analytics',
    defaultMessage: 'Analytics',
  },
  linksAndBranding: {
    id: 'ServerSettingsTabs.linksAndBranding',
    defaultMessage: 'Links & Branding',
  },
});

const ServerSettingsTabs = ({ activeTab, onChangeTab, intl }) => {
  const { trackEvent } = useTracking();

  useEffect(() => {
    if (activeTab) {
      trackEvent(getServerSettingsPageViewEvent(activeTab));
    }
  }, [activeTab, trackEvent]);

  const createTabLink = (tabName) => ({
    type: SERVER_SETTINGS_TAB_PAGE,
    payload: { settingsTab: tabName },
  });

  const createTabsConfig = () => ({
    [AUTHORIZATION_CONFIGURATION]: {
      name: intl.formatMessage(messages.authConfiguration),
      link: createTabLink(AUTHORIZATION_CONFIGURATION),
      component: <AuthConfigurationTab />,
      mobileDisabled: true,
      eventInfo: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.AUTHORIZATION_CONFIGURATION_TAB,
    },
    [ANALYTICS]: {
      name: intl.formatMessage(messages.statistics),
      link: createTabLink(ANALYTICS),
      component: <AnalyticsTab />,
      mobileDisabled: true,
      eventInfo: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.ANALYTICS_TAB,
    },
    [LINKS_AND_BRANDING]: {
      name: intl.formatMessage(messages.linksAndBranding),
      link: createTabLink(LINKS_AND_BRANDING),
      component: <LinksAndBrandingTab />,
      mobileDisabled: true,
      eventInfo: ADMIN_SERVER_SETTINGS_PAGE_EVENTS.LINKS_AND_BRANDING_TAB,
    },
  });

  return (
    <NavigationTabs
      config={createTabsConfig()}
      activeTab={activeTab}
      onChangeTab={onChangeTab}
      mobileDisabled
    />
  );
};
ServerSettingsTabs.propTypes = {
  intl: PropTypes.object.isRequired,
  activeTab: PropTypes.string,
  onChangeTab: PropTypes.func,
};
ServerSettingsTabs.defaultProps = {
  activeTab: AUTHORIZATION_CONFIGURATION,
  onChangeTab: () => {},
};

export const ServerSettingsTabsWrapper = connect(
  (state) => ({
    activeTab: settingsTabSelector(state),
  }),
  {
    onChangeTab: (linkAction) => linkAction,
  },
)(injectIntl(ServerSettingsTabs));
