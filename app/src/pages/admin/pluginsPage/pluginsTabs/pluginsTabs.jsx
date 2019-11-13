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
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { PLUGINS_TAB_PAGE, pluginsTabSelector } from 'controllers/pages';
import { INSTALLED, STORE } from 'common/constants/pluginsTabs';
import { NavigationTabs } from 'components/main/navigationTabs';
import { InstalledTab } from './installedTab';
import { StoreTab } from './storeTab';
import { PluginsToolbar } from './../pluginsToolbar';

const messages = defineMessages({
  installed: {
    id: 'PluginsTabs.installed',
    defaultMessage: 'Installed',
  },
  store: {
    id: 'PluginsTabs.store',
    defaultMessage: 'Store',
  },
});

@connect(
  (state) => ({
    activeTab: pluginsTabSelector(state),
  }),
  {
    onChangeTab: (linkAction) => linkAction,
  },
)
@injectIntl
export class PluginsTabs extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    filterItems: PropTypes.array.isRequired,
    plugins: PropTypes.array.isRequired,
    activeTab: PropTypes.string,
    onChangeTab: PropTypes.func,
  };
  static defaultProps = {
    activeTab: INSTALLED,
    onChangeTab: () => {},
  };

  createTabLink = (tabName) => ({
    type: PLUGINS_TAB_PAGE,
    payload: { pluginsTab: tabName },
  });

  createTabsConfig = () => ({
    [INSTALLED]: {
      name: this.props.intl.formatMessage(messages.installed),
      link: this.createTabLink(INSTALLED),
      component: <InstalledTab plugins={this.props.plugins} filterItems={this.props.filterItems} />,
    },
    [STORE]: {
      name: this.props.intl.formatMessage(messages.store),
      link: this.createTabLink(STORE),
      component: <StoreTab />,
      mobileDisabled: true,
    },
  });

  render = () => (
    <NavigationTabs
      config={this.createTabsConfig()}
      activeTab={this.props.activeTab}
      onChangeTab={this.props.onChangeTab}
      customBlock={<PluginsToolbar />}
    />
  );
}
