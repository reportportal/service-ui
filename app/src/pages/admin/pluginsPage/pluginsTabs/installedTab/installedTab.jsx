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
import track from 'react-tracking';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { getPluginsFilter } from 'common/constants/pluginsFilter';
import { ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { updatePluginSuccessAction } from 'controllers/plugins';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { getPluginFilterTabClickEvent } from 'components/main/analytics/events';
import { SimpleBreadcrumbs } from 'components/main/simpleBreadcrumbs';
import {
  IntegrationInfoContainer,
  IntegrationSettingsContainer,
} from 'components/integrations/containers';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { PLUGIN_NAME_TITLES } from 'components/integrations';
import { InputDropdown } from 'components/inputs/inputDropdown';
import {
  INSTALLED_PLUGINS_SUBPAGE,
  INSTALLED_PLUGINS_SETTINGS_SUBPAGE,
  SUB_PAGES_SEQUENCE,
  DEFAULT_BREADCRUMB,
} from './constants';
import styles from './installedTab.scss';
import { PluginsFilter } from '../../pluginsFilter';
import { PluginsListItems } from '../../pluginsListItems';

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
      'Are you sure you want to disable a plugin {pluginName}? If you disable plugin, information about it will be hidden on the Project Settings and users can not interact with it',
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
@connect(null, {
  showNotification,
  updatePluginSuccessAction,
  showModalAction,
})
@track()
export class InstalledTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterItems: PropTypes.array.isRequired,
    showModalAction: PropTypes.func.isRequired,
    plugins: PropTypes.array.isRequired,
    updatePluginSuccessAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    showNotification: () => {},
  };

  state = {
    activeFilterItem: ALL_GROUP_TYPE,
    subPage: DEFAULT_BREADCRUMB,
  };

  onToggleActive = (itemData) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const toggleActive = !itemData.enabled;

    return fetch(URLS.pluginUpdate(itemData.type), {
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
      },
    });
  };

  showDisablePluginModal = (pluginName, callback) => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.disablePluginMessage, { pluginName }),
        onConfirm: callback,
        dangerConfirm: true,
        title: formatMessage(messages.disablePluginTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.DISABLE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      },
    });
  };

  showToggleConfirmationModal = (isEnabled, pluginName, callback) => {
    isEnabled
      ? this.showDisablePluginModal(pluginName, callback)
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
      default:
        return (
          <div className={cx('plugins-content-wrapper')}>
            <PluginsFilter
              filterItems={filterItems}
              activeItem={activeFilterItem}
              onFilterChange={this.handleFilterChange}
            />
            <div className={cx('plugins-content')}>
              <PluginsListItems
                title={activeFilterItem}
                items={this.getFilterPluginsList(activeFilterItem)}
                filterMobileBlock={this.renderFilterMobileBlock()}
                showToggleConfirmationModal={this.showToggleConfirmationModal}
                onToggleActive={this.onToggleActive}
                onItemClick={this.installedPluginsSubPageHandler}
              />
            </div>
          </div>
        );
    }
  };

  getBreadcrumbs = () => {
    const { subPage } = this.state;
    const breadcrumbs = [DEFAULT_BREADCRUMB];

    SUB_PAGES_SEQUENCE.some((pageType) => {
      const cachedPage = this.subPagesCache[pageType];
      const isLastPage = pageType === subPage.type;
      breadcrumbs.push(isLastPage ? subPage : cachedPage);

      return isLastPage;
    });
    return breadcrumbs;
  };

  getFilterPluginsList = (activeFilterItem) => {
    const { plugins } = this.props;

    if (activeFilterItem === ALL_GROUP_TYPE) {
      return plugins;
    }

    return plugins.filter((item) => item.groupType === activeFilterItem);
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
    this.props.tracking.trackEvent(getPluginFilterTabClickEvent(value));
    if (value !== this.state.activeFilterItem) {
      this.setState({
        activeFilterItem: value,
      });
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
      title: PLUGIN_NAME_TITLES[pageData.name] || pageData.name,
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
