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
import DOMPurify from 'dompurify';
import semverDiff from 'semver-diff';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { getPluginsFilter, PLUGIN_FILTER_GROUP_VALUES } from 'common/constants/pluginsFilter';
import { ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import {
  updatePluginSuccessAction,
  fetchMarketplaceCatalogueAction,
  installMarketplacePluginAction,
  clearJustInstalledMarketplacePluginAction,
  marketplaceAvailablePluginsSelector,
  marketplaceInstalledPluginsSelector,
  marketplaceCatalogueLoadingSelector,
  marketplaceRegistryHostSelector,
  justInstalledMarketplacePluginSelector,
  marketplaceInstallingPluginsSelector,
  marketplaceInstallErrorSelector,
  isPluginUploadAllowedSelector,
  isMarketplaceRegistryOfflineSelector,
  hasMarketplaceCatalogueFailedSelector,
  fetchMarketplacePluginDetailAction,
  marketplacePluginDetailDataSelector,
  marketplacePluginDetailLoadingSelector,
  isMarketplacePluginDetailOfflineSelector,
  hasMarketplacePluginDetailFailedSelector,
  marketplacePluginDetailRegistryHostSelector,
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
import { PluginsCatalog, ROW_ACTIONS, getDisplayName } from '../../pluginsCatalog';
import { PluginMarketplaceBlocks } from '../../pluginMarketplaceBlocks';
import { premiumPromoModal } from '../../premiumPromo';
import { installPluginModal } from '../../modals/installPluginModal';

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
  installPluginTitle: {
    id: 'PluginItem.installPluginTitle',
    defaultMessage: 'Install Plugin',
  },
  installPluginMessage: {
    id: 'PluginItem.installPluginMessage',
    defaultMessage:
      '<b>{pluginName}</b> will be downloaded from the marketplace and installed on this instance.',
  },
  install: {
    id: 'PluginItem.install',
    defaultMessage: 'Install',
  },
  upgradeVersionTitle: {
    id: 'PluginItem.upgradeVersionTitle',
    defaultMessage: 'Upgrade Version',
  },
  upgradeVersionMessage: {
    id: 'PluginItem.upgradeVersionMessage',
    defaultMessage:
      '<b>{pluginName}</b> will be upgraded to <b>{version}</b>. The instance keeps one version at a time, so the current one will be replaced.',
  },
  upgrade: {
    id: 'PluginItem.upgrade',
    defaultMessage: 'Upgrade',
  },
  downgradeVersionTitle: {
    id: 'PluginItem.downgradeVersionTitle',
    defaultMessage: 'Downgrade Version',
  },
  downgradeVersionMessage: {
    id: 'PluginItem.downgradeVersionMessage',
    defaultMessage:
      '<b>{pluginName}</b> will be downgraded to <b>{version}</b>. The instance keeps one version at a time, so the current one will be replaced.',
  },
  downgrade: {
    id: 'PluginItem.downgrade',
    defaultMessage: 'Downgrade',
  },
});

// the modal parses its message as markup, so the emphasis has to reach it as a sanitised string
const bold = (chunks) => DOMPurify.sanitize(`<b>${chunks}</b>`);

/**
 * Whether posting this version moves the instance forward from the one it is running.
 *
 * <p>Both dialogs warn that the running version is replaced and only the verb differs, so a pair
 * that cannot be compared — a plugin whose installed version was never recorded, or a registry
 * that published something semver cannot parse — takes the downgrade wording rather than
 * promising an upgrade nobody has established. `semverDiff` throws on either of those, which is
 * why the answer is not simply its return value.
 *
 * <p>It is coerced first because plugins are not disciplined about the third segment: a version
 * recorded as `5.7` is not semver and made `semverDiff` throw, so every pick from a plugin
 * versioned that way was confirmed as a downgrade — including picks that plainly move forward.
 */
const SEMVER_CORE = /^\d+(\.\d+){0,2}/;

const toComparable = (value) => {
  const core = SEMVER_CORE.exec(String(value ?? ''))?.[0];

  if (!core) {
    return null;
  }

  const segments = core.split('.');

  return [...segments, ...Array(3 - segments.length).fill('0')].join('.');
};

const isUpgradeFrom = (installedVersion, version) => {
  const from = toComparable(installedVersion);
  const to = toComparable(version);

  if (!from || !to) {
    return false;
  }

  try {
    return Boolean(semverDiff(from, to));
  } catch {
    return false;
  }
};

@injectIntl
@track()
@connect(
  (state) => ({
    disablePluginPopupContent: (pluginName) => disablePluginPopupContentSelector(state, pluginName),
    marketplaceInstalled: marketplaceInstalledPluginsSelector(state),
    availablePlugins: marketplaceAvailablePluginsSelector(state),
    catalogueLoading: marketplaceCatalogueLoadingSelector(state),
    registryOffline: isMarketplaceRegistryOfflineSelector(state),
    catalogueFailed: hasMarketplaceCatalogueFailedSelector(state),
    registryHost: marketplaceRegistryHostSelector(state),
    justInstalledId: justInstalledMarketplacePluginSelector(state),
    installingIds: marketplaceInstallingPluginsSelector(state),
    // which row it failed for is all the row shows; the reason was the notification's to tell
    installFailedId: marketplaceInstallErrorSelector(state)?.registryId || null,
    uploadAllowed: isPluginUploadAllowedSelector(state),
    pluginDetail: marketplacePluginDetailDataSelector(state),
    detailLoading: marketplacePluginDetailLoadingSelector(state),
    detailOffline: isMarketplacePluginDetailOfflineSelector(state),
    detailFailed: hasMarketplacePluginDetailFailedSelector(state),
    detailRegistryHost: marketplacePluginDetailRegistryHostSelector(state),
  }),
  {
    showNotification,
    updatePluginSuccessAction,
    showModalAction,
    fetchMarketplaceCatalogueAction,
    installMarketplacePluginAction,
    clearJustInstalledMarketplacePluginAction,
    fetchMarketplacePluginDetailAction,
  },
)
export class InstalledTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterItems: PropTypes.array.isRequired,
    showModalAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({ trackEvent: PropTypes.func }).isRequired,
    plugins: PropTypes.array.isRequired,
    updatePluginSuccessAction: PropTypes.func.isRequired,
    disablePluginPopupContent: PropTypes.func.isRequired,
    marketplaceInstalled: PropTypes.array.isRequired,
    availablePlugins: PropTypes.array.isRequired,
    catalogueLoading: PropTypes.bool.isRequired,
    registryOffline: PropTypes.bool.isRequired,
    catalogueFailed: PropTypes.bool.isRequired,
    fetchMarketplaceCatalogueAction: PropTypes.func.isRequired,
    installMarketplacePluginAction: PropTypes.func.isRequired,
    registryHost: PropTypes.string,
    justInstalledId: PropTypes.string,
    installingIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    installFailedId: PropTypes.string,
    uploadAllowed: PropTypes.bool.isRequired,
    clearJustInstalledMarketplacePluginAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func,
    pluginDetail: PropTypes.object.isRequired,
    detailLoading: PropTypes.bool.isRequired,
    detailOffline: PropTypes.bool.isRequired,
    detailFailed: PropTypes.bool.isRequired,
    fetchMarketplacePluginDetailAction: PropTypes.func.isRequired,
    detailRegistryHost: PropTypes.string,
  };

  static defaultProps = {
    justInstalledId: null,
    installFailedId: null,
    detailRegistryHost: null,
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

  // The highlight answers one question — where did it go — and only for as long as that question
  // is live. Leaving the page, or narrowing the list to look for something else, is the user
  // saying they have moved on, so the mark goes with them rather than sitting there as a status.
  componentWillUnmount() {
    this.forgetJustInstalled();
  }

  forgetJustInstalled = () => {
    if (this.props.justInstalledId) {
      this.props.clearJustInstalledMarketplacePluginAction();
    }
  };

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

  /**
   * An install changes what this instance runs, so it may not travel from a click straight to a
   * download. The dialog names no version: an install always takes the one the registry publishes
   * as latest, so there is no choice here to state.
   */
  /**
   * The install dialog the design draws: the same sentence, plus the version it will post. Used
   * wherever the version list is in hand — the plugin's own page and every row of its versions
   * table. A catalogue row has only `latestVersion` and no list to choose from, so it keeps the
   * plain confirmation below.
   */
  showInstallVersionModal = (pluginName, versions, defaultVersion, callback) => {
    this.props.showModalAction(
      installPluginModal({
        pluginName,
        versions,
        defaultVersion,
        onInstall: callback,
      }),
    );
  };

  showInstallPluginModal = (pluginName, callback) => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.installPluginMessage, { pluginName, b: bold }),
        onConfirm: callback,
        title: formatMessage(messages.installPluginTitle),
        confirmText: formatMessage(messages.install),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      },
    });
  };

  // an upgrade and a rollback are the same request, and the dialog is the only place the two are
  // told apart — which is the whole reason an admin is asked before one of them runs
  showVersionChangeModal = (pluginName, version, upgrade, callback) => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(
          upgrade ? messages.upgradeVersionMessage : messages.downgradeVersionMessage,
          { pluginName, version, b: bold },
        ),
        onConfirm: callback,
        title: formatMessage(
          upgrade ? messages.upgradeVersionTitle : messages.downgradeVersionTitle,
        ),
        confirmText: formatMessage(upgrade ? messages.upgrade : messages.downgrade),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
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
          // What the registry says about this plugin sits below the plugin's own header and
          // above its integrations: an alert about a plugin has to appear under the name of the
          // plugin it is about, not above the breadcrumb where it reads as the page's.
          <IntegrationInfoContainer
            integrationType={data}
            isGlobal
            onToggleActive={this.onToggleActive}
            onItemClick={this.installedPluginsSettingsSubPageHandler}
            showToggleConfirmationModal={this.showToggleConfirmationModal}
            removePluginSuccessCallback={this.goToMainPageHandler}
            events={PLUGINS_PAGE_EVENTS}
            afterInfoSection={this.renderMarketplaceBlocks(data)}
            title={getDisplayName(data)}
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
        return (
          <AvailablePluginDetail
            key={data.name}
            plugin={data}
            detail={this.props.pluginDetail}
            loading={this.props.detailLoading}
            offline={this.props.detailOffline}
            failed={this.props.detailFailed}
            registryHost={this.props.detailRegistryHost}
            onInstall={this.handleInstallFromDetail}
            onRetry={this.refetchPluginDetail}
            installing={this.props.installingIds.includes(data.id)}
          />
        );
      default: {
        const {
          plugins,
          marketplaceInstalled,
          availablePlugins,
          catalogueLoading,
          registryOffline,
          catalogueFailed,
          registryHost,
        } = this.props;

        return (
          <div className={cx('plugins-content-wrapper')}>
            {/* Chips and the upload control sit in a header above the list, so the content
                column is the full width the design gives it. */}
            <div className={cx('plugins-header')}>
              <PluginsFilter
                filterItems={filterItems}
                activeItem={activeFilterItem}
                onFilterChange={this.handleFilterChange}
              />
              {/* Absent, not disabled. The capability is switched off by environment, which is
                  not a permission error and must not be shown as one. */}
              {this.props.uploadAllowed && <ActionPanel />}
            </div>
            <div className={cx('plugins-content')}>
              {this.renderFilterMobileBlock()}
              <PluginsCatalog
                installedPlugins={plugins}
                marketplaceInstalled={marketplaceInstalled}
                availablePlugins={availablePlugins}
                loading={catalogueLoading}
                offline={registryOffline}
                failed={catalogueFailed}
                registryHost={registryHost}
                activeCategory={activeFilterItem}
                query={this.state.searchQuery}
                onQueryChange={this.handleQueryChange}
                onRetry={this.refetchCatalogue}
                onRowAction={this.handleRowAction}
                onInstalledItemClick={this.installedPluginsSubPageHandler}
                onAvailableItemClick={this.availablePluginDetailSubPageHandler}
                justInstalledId={this.props.justInstalledId}
                installingIds={this.props.installingIds}
                installFailedId={this.props.installFailedId}
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

  // Formatted here rather than handed over as an element: an option label is text, and the
  // kit's Dropdown — where this is headed — declares `label: string`.
  generateOptions = () =>
    getPluginsFilter(this.props.filterItems).map((item) => ({
      label: this.props.intl.formatMessage(item.message),
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

  // the chip and the query are both server-side filters; ALL and INSTALLED are synthetic
  // chips this endpoint knows nothing about, so they narrow nothing remotely
  catalogueParams = ({
    query = this.state.searchQuery,
    category = this.state.activeFilterItem,
  }) => ({
    q: query.trim() || null,
    category: PLUGIN_FILTER_GROUP_VALUES.includes(category) ? category : null,
  });

  refetchCatalogue = () => this.props.fetchMarketplaceCatalogueAction(this.catalogueParams({}));

  handleFilterChange = (value) => {
    if (value !== this.state.activeFilterItem) {
      this.forgetJustInstalled();
      this.setState({
        activeFilterItem: value,
      });
      this.props.fetchMarketplaceCatalogueAction(this.catalogueParams({ category: value }));
    }
  };

  // the field stays responsive while the request waits: only the request is debounced
  handleQueryChange = (searchQuery) => {
    this.forgetJustInstalled();
    this.setState({ searchQuery });
    this.props.fetchMarketplaceCatalogueAction({
      ...this.catalogueParams({ query: searchQuery }),
      debounced: true,
    });
  };

  // install, update and rollback are the same request: make this version the active one
  handleRowAction = (action, row) => {
    if (action === ROW_ACTIONS.INSTALL) {
      this.showInstallPluginModal(getDisplayName(row), () =>
        this.props.installMarketplacePluginAction(row.registryId, row.latestVersion),
      );
    } else if (action === ROW_ACTIONS.UPDATE) {
      this.showVersionChangeModal(getDisplayName(row), row.updateAvailable, true, () =>
        this.props.installMarketplacePluginAction(row.registryId, row.updateAvailable),
      );
    } else if (action === ROW_ACTIONS.DISCOVER_PREMIUM) {
      // the same modal the plugin page opens, built in the same place, so one button cannot
      // start meaning two things again
      this.props.showModalAction(
        premiumPromoModal({
          trackEvent: this.props.tracking.trackEvent,
          title: getDisplayName(row),
          contactUrl: row.contactUrl,
        }),
      );
    }
  };

  installedPluginsSettingsSubPageHandler = (pageData, pageTitle) =>
    this.changeSubPage({
      type: INSTALLED_PLUGINS_SETTINGS_SUBPAGE,
      data: pageData,
      title: pageTitle,
    });

  // a plugin with no registry id was never asked about, so the reason nothing can be shown is
  // the catalogue's — the registry was down, the catalogue failed, or it matched no entry
  renderMarketplaceBlocks = (data) => {
    const unmatched = !data.registryId;

    return (
      <PluginMarketplaceBlocks
        detail={this.props.pluginDetail}
        loading={!unmatched && this.props.detailLoading}
        offline={unmatched ? this.props.registryOffline : this.props.detailOffline}
        failed={unmatched ? this.props.catalogueFailed : this.props.detailFailed}
        unmatched={unmatched}
        registryHost={unmatched ? this.props.registryHost : this.props.detailRegistryHost}
        onRetry={unmatched ? this.refetchCatalogue : this.refetchPluginDetail}
        installedVersion={data.details?.version || null}
        installing={this.props.installingIds.includes(data.registryId)}
        onUseVersion={(version) =>
          this.showVersionChangeModal(
            getDisplayName(data),
            version,
            isUpgradeFrom(data.details?.version, version),
            () => this.props.installMarketplacePluginAction(data.registryId, version),
          )
        }
      />
    );
  };

  // a plugin the registry could not be asked about has no page of registry content to fetch
  fetchPluginDetail = (registryId) => {
    if (registryId) {
      this.props.fetchMarketplacePluginDetailAction(registryId);
    }
  };

  refetchPluginDetail = () => this.fetchPluginDetail(this.state.subPage.data?.registryId);

  // the page has the registry's version list in hand, so the header offers the choice the design
  // asks for; with no list to offer it falls back to the plain confirmation and the latest build
  handleInstallFromDetail = (row, version = null) => {
    const versions = this.props.pluginDetail?.versions || [];
    const install = (chosen) =>
      this.props.installMarketplacePluginAction(row.registryId, chosen || row.latestVersion);

    if (versions.length === 0) {
      this.showInstallPluginModal(getDisplayName(row), () => install(null));

      return;
    }

    this.showInstallVersionModal(
      getDisplayName(row),
      versions,
      version || row.latestVersion,
      install,
    );
  };

  installedPluginsSubPageHandler = (pageData) => {
    this.fetchPluginDetail(pageData.registryId);

    return this.changeSubPage({
      type: INSTALLED_PLUGINS_SUBPAGE,
      data: pageData,
      title: getDisplayName(pageData),
    });
  };

  availablePluginDetailSubPageHandler = (pageData) => {
    this.fetchPluginDetail(pageData.registryId);

    return this.changeSubPage({
      type: AVAILABLE_PLUGIN_DETAIL_SUBPAGE,
      data: pageData,
      title: getDisplayName(pageData),
    });
  };

  renderFilterMobileBlock = () => (
    <div className={cx('plugins-filter-mobile')}>
      {/* Still the legacy dropdown. The kit's Dropdown is the component this should be, but it
          calls downshift's getMenuProps only inside its `opened &&` branch, and downshift
          requires that getter on every render — so mounting it closed throws
          "You forgot to call the getMenuProps getter function". Verified in isolation, with
          nothing of ours in the tree. Fixed upstream in the ui-kit; swap this the release after
          that lands. */}
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
