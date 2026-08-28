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
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { getPluginsFilter } from 'common/constants/pluginsFilter';
import { ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import {
  updatePluginSuccessAction,
  fetchMarketplaceCatalogueAction,
  installMarketplacePluginAction,
  marketplaceAvailablePluginsSelector,
  marketplaceInstalledPluginsSelector,
  marketplaceCatalogueLoadingSelector,
  marketplaceRegistryHostSelector,
  isMarketplaceRegistryOfflineSelector,
} from 'controllers/plugins';
import { disablePluginPopupContentSelector } from 'controllers/plugins/uiExtensions';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { SimpleBreadcrumbs } from 'components/main/simpleBreadcrumbs';
import {
  IntegrationInfoContainer,
  IntegrationSettingsContainer,
} from 'components/integrations/containers';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { InputDropdown } from 'components/inputs/inputDropdown';
import {
  INSTALLED_PLUGINS_SUBPAGE,
  INSTALLED_PLUGINS_SETTINGS_SUBPAGE,
  AVAILABLE_PLUGIN_DETAIL_SUBPAGE,
  SUB_PAGES_SEQUENCE,
  DEFAULT_BREADCRUMB,
  AVAILABLE_PLUGIN_DETAIL_BREADCRUMB,
} from './constants';
import styles from './installedTab.scss';
import { PluginsFilter } from '../../pluginsFilter';
import { ActionPanel } from '../../actionPanel';
import { AvailablePluginDetail } from '../../availablePluginDetail';
import { PluginsCatalog, ROW_ACTIONS } from '../../pluginsCatalog';

const cx = classNames.bind(styles);

const messages = defineMessages({
  disabledPluginMessage: {
    id: 'PluginItem.disabledPluginMessage',
    defaultMessage: 'Plugin has been disabled',
  },
  enabledPluginMessage: {
    id: 'PluginItem.enabledPluginMessage',
    defaultMessage: 'Plugin has been enabled',
  },
  disablePluginTitle: {
    id: 'PluginItem.disablePluginTitle',
    defaultMessage: 'Disable plugin',
  },
  disablePluginMessage: {
    id: 'PluginItem.disablePluginMessage',
    defaultMessage:
      'Are you sure you want to disable a plugin {pluginName}? If you disable plugin, information about it will be hidden on the {pluginLocation} and users can not interact with it',
  },
  enablePluginTitle: {
    id: 'PluginItem.enablePluginTitle',
    defaultMessage: 'Enable plugin',
  },
  enablePluginMessage: {
    id: 'PluginItem.enablePluginMessage',
    defaultMessage: 'Are you sure you want to enable a plugin {pluginName}?',
  },
});

@injectIntl
@connect(
  (state) => ({
    disablePluginPopupContent: (pluginName) => disablePluginPopupContentSelector(state, pluginName),
    marketplaceInstalled: marketplaceInstalledPluginsSelector(state),
    availablePlugins: marketplaceAvailablePluginsSelector(state),
    catalogueLoading: marketplaceCatalogueLoadingSelector(state),
    registryOffline: isMarketplaceRegistryOfflineSelector(state),
    registryHost: marketplaceRegistryHostSelector(state),
  }),
  {
    showNotification,
    updatePluginSuccessAction,
    showModalAction,
    fetchMarketplaceCatalogueAction,
    installMarketplacePluginAction,
  },
)
export class InstalledTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterItems: PropTypes.array.isRequired,
    showModalAction: PropTypes.func.isRequired,
    plugins: PropTypes.array.isRequired,
    updatePluginSuccessAction: PropTypes.func.isRequired,
    disablePluginPopupContent: PropTypes.func.isRequired,
    marketplaceInstalled: PropTypes.array.isRequired,
    availablePlugins: PropTypes.array.isRequired,
    catalogueLoading: PropTypes.bool.isRequired,
    registryOffline: PropTypes.bool.isRequired,
    fetchMarketplaceCatalogueAction: PropTypes.func.isRequired,
    installMarketplacePluginAction: PropTypes.func.isRequired,
    registryHost: PropTypes.string,
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    registryHost: null,
    showNotification: () => {},
  };

  state = {
    activeFilterItem: ALL_GROUP_TYPE,
    searchQuery: '',
    subPage: DEFAULT_BREADCRUMB,
  };

  componentDidMount() {
    this.props.fetchMarketplaceCatalogueAction();
  }

  onToggleActive = (itemData) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const toggleActive = !itemData.enabled;

    return fetch(URLS.pluginById(itemData.type), {
      method: 'PUT',
      data: {
        enabled: toggleActive,
      },
    }).then(() => {
      const plugin = {
        ...itemData,
        enabled: toggleActive,
      };

      this.props.updatePluginSuccessAction(plugin);
      this.props.showNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: toggleActive
          ? formatMessage(messages.enabledPluginMessage)
          : formatMessage(messages.disabledPluginMessage),
      });
    });
  };

  showEnablePluginModal = (pluginName, callback) => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.enablePluginMessage, { pluginName }),
        onConfirm: callback,
        title: formatMessage(messages.enablePluginTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.ENABLE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        eventsInfo: {
          confirmBtn: PLUGINS_PAGE_EVENTS.clickEnablePlugin(pluginName),
        },
      },
    });
  };

  showDisablePluginModal = (pluginName, pluginLocation, callback, pluginId = null) => {
    const {
      intl: { formatMessage, locale },
      disablePluginPopupContent,
      plugins,
    } = this.props;

    const plugin = plugins.find((p) => p.name === pluginName);
    const displayName = plugin?.details?.name || plugin?.name || pluginName;
    const manifestLookupName = pluginId || pluginName;

    const customMessageData = disablePluginPopupContent(manifestLookupName);
    const customMessage =
      typeof customMessageData === 'object'
        ? customMessageData?.[locale] || customMessageData?.en
        : customMessageData;

    const message =
      customMessage ||
      formatMessage(messages.disablePluginMessage, { pluginName: displayName, pluginLocation });

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message,
        onConfirm: callback,
        dangerConfirm: true,
        title: formatMessage(messages.disablePluginTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.DISABLE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        eventsInfo: {
          confirmBtn: PLUGINS_PAGE_EVENTS.clickDisablePlugin(pluginName),
        },
      },
    });
  };

  showToggleConfirmationModal = (
    isEnabled,
    pluginName,
    callback,
    pluginLocation = 'Project Settings',
    pluginId = null,
  ) => {
    isEnabled
      ? this.showDisablePluginModal(pluginName, pluginLocation, callback, pluginId)
      : this.showEnablePluginModal(pluginName, callback);
  };

  getPageContent = () => {
    const {
      subPage: { type, data, title },
      activeFilterItem,
    } = this.state;
    const { filterItems } = this.props;

    switch (type) {
      case INSTALLED_PLUGINS_SUBPAGE:
        return (
          <IntegrationInfoContainer
            integrationType={data}
            isGlobal
            onToggleActive={this.onToggleActive}
            onItemClick={this.installedPluginsSettingsSubPageHandler}
            showToggleConfirmationModal={this.showToggleConfirmationModal}
            removePluginSuccessCallback={this.goToMainPageHandler}
            events={PLUGINS_PAGE_EVENTS}
          />
        );
      case INSTALLED_PLUGINS_SETTINGS_SUBPAGE:
        return (
          <IntegrationSettingsContainer
            data={data}
            title={title}
            isGlobal
            goToPreviousPage={this.goToCachedSubPageHandler}
          />
        );
      case AVAILABLE_PLUGIN_DETAIL_SUBPAGE:
        return <AvailablePluginDetail key={data.name} plugin={data} />;
      default: {
        const {
          plugins,
          marketplaceInstalled,
          availablePlugins,
          catalogueLoading,
          registryOffline,
          registryHost,
        } = this.props;

        return (
          <div className={cx('plugins-content-wrapper')}>
            <div className={cx('plugins-sidebar')}>
              <PluginsFilter
                filterItems={filterItems}
                activeItem={activeFilterItem}
                onFilterChange={this.handleFilterChange}
              />
              <ActionPanel />
            </div>
            <div className={cx('plugins-content')}>
              {this.renderFilterMobileBlock()}
              <PluginsCatalog
                installedPlugins={plugins}
                marketplaceInstalled={marketplaceInstalled}
                availablePlugins={availablePlugins}
                loading={catalogueLoading}
                offline={registryOffline}
                registryHost={registryHost}
                activeCategory={activeFilterItem}
                query={this.state.searchQuery}
                onQueryChange={this.handleQueryChange}
                onRowAction={this.handleRowAction}
                onInstalledItemClick={this.installedPluginsSubPageHandler}
                onAvailableItemClick={this.availablePluginDetailSubPageHandler}
                onToggleActive={this.onToggleActive}
                showToggleConfirmationModal={this.showToggleConfirmationModal}
              />
            </div>
          </div>
        );
      }
    }
  };

  getBreadcrumbs = () => {
    const { subPage } = this.state;

    if (subPage.type === AVAILABLE_PLUGIN_DETAIL_SUBPAGE) {
      return [AVAILABLE_PLUGIN_DETAIL_BREADCRUMB, subPage];
    }

    const breadcrumbs = [DEFAULT_BREADCRUMB];

    SUB_PAGES_SEQUENCE.some((pageType) => {
      const cachedPage = this.subPagesCache[pageType];
      const isLastPage = pageType === subPage.type;
      breadcrumbs.push(isLastPage ? subPage : cachedPage);

      return isLastPage;
    });
    return breadcrumbs;
  };

  generateOptions = () =>
    getPluginsFilter(this.props.filterItems).map((item) => ({
      label: item.label,
      value: item.value,
    }));

  goToMainPageHandler = () => this.changeSubPage(DEFAULT_BREADCRUMB);

  goToCachedSubPageHandler = () =>
    this.changeSubPage(this.subPagesCache[INSTALLED_PLUGINS_SUBPAGE]);

  changeSubPage = (subPage) => {
    this.subPagesCache[subPage.type] = subPage;
    this.setState({ subPage });
  };

  subPagesCache = {};

  handleFilterChange = (value) => {
    if (value !== this.state.activeFilterItem) {
      this.setState({
        activeFilterItem: value,
      });
    }
  };

  handleQueryChange = (searchQuery) => this.setState({ searchQuery });

  // install, update and rollback are the same request: make this version the active one
  handleRowAction = (action, row) => {
    if (action === ROW_ACTIONS.INSTALL) {
      this.props.installMarketplacePluginAction(row.registryId, row.latestVersion);
    } else if (action === ROW_ACTIONS.UPDATE) {
      this.props.installMarketplacePluginAction(row.registryId, row.updateAvailable);
    } else if (action === ROW_ACTIONS.DISCOVER_PREMIUM && row.contactUrl) {
      window.open(row.contactUrl, '_blank', 'noopener,noreferrer');
    }
  };

  installedPluginsSettingsSubPageHandler = (pageData, pageTitle) =>
    this.changeSubPage({
      type: INSTALLED_PLUGINS_SETTINGS_SUBPAGE,
      data: pageData,
      title: pageTitle,
    });

  installedPluginsSubPageHandler = (pageData) =>
    this.changeSubPage({
      type: INSTALLED_PLUGINS_SUBPAGE,
      data: pageData,
      title: pageData.details.name || pageData.name,
    });

  availablePluginDetailSubPageHandler = (pageData) =>
    this.changeSubPage({
      type: AVAILABLE_PLUGIN_DETAIL_SUBPAGE,
      data: pageData,
      title: pageData.details.name || pageData.name,
    });

  renderFilterMobileBlock = () => (
    <div className={cx('plugins-filter-mobile')}>
      <InputDropdown
        options={this.generateOptions()}
        value={this.state.activeFilterItem}
        onChange={this.handleFilterChange}
      />
    </div>
  );

  render() {
    const { subPage } = this.state;

    return (
      <div className={cx('plugins-wrapper')}>
        <div className={cx('plugins-sub-content-wrapper')}>
          {subPage.type && (
            <SimpleBreadcrumbs
              descriptors={this.getBreadcrumbs()}
              onClickItem={this.changeSubPage}
            />
          )}
          {this.getPageContent()}
        </div>
      </div>
    );
  }
}
