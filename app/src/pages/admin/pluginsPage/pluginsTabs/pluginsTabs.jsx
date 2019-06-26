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
      mobileDisabled: true,
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
