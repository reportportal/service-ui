/*
 * Copyright 2026 EPAM Systems
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

import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { BubblesLoader, Button } from '@reportportal/ui-kit';
import { ALL_GROUP_TYPE, AVAILABLE_PLUGINS_TYPE } from 'common/constants/pluginsGroupTypes';
import { PLUGINS_FILTER_MESSAGES } from 'common/constants/pluginsFilter';
import { SearchField } from 'components/fields/searchField';
import { PluginsListItems } from '../pluginsListItems';
import { RegistryOfflineAlert } from '../registryOfflineAlert';
import { CatalogueUnavailableAlert } from '../catalogueUnavailableAlert';
import {
  filterRows,
  isMarketplaceTrusted,
  mergeInstalledRows,
  sortByGroupAndName,
  sortByTierGroupAndName,
  toAvailableRow,
  withInstallState,
} from './utils';
import styles from './pluginsCatalog.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchPlaceholder: {
    id: 'PluginsCatalog.searchPlaceholder',
    defaultMessage: 'Search plugins by name',
  },
  noSearchResultsTitle: {
    id: 'PluginsCatalog.noSearchResultsTitle',
    defaultMessage: 'No plugins match “{query}”',
  },
  noSearchResultsDescription: {
    id: 'PluginsCatalog.noSearchResultsDescription',
    defaultMessage: 'Try a shorter name, or clear the search to see the whole catalogue.',
  },
  clearSearch: {
    id: 'PluginsCatalog.clearSearch',
    defaultMessage: 'Clear search',
  },
  noCategoryResultsTitle: {
    id: 'PluginsCatalog.noCategoryResultsTitle',
    defaultMessage: 'No plugins in {category}',
  },
  noCategoryResultsDescription: {
    id: 'PluginsCatalog.noCategoryResultsDescription',
    defaultMessage:
      'Nothing in this category is installed on this instance or offered by the marketplace.',
  },
  // offline the marketplace was not asked, so the copy may only speak for this instance
  noSearchResultsDescriptionOffline: {
    id: 'PluginsCatalog.noSearchResultsDescriptionOffline',
    defaultMessage: 'Try a shorter name, or clear the search to see every installed plugin.',
  },
  noCategoryResultsDescriptionOffline: {
    id: 'PluginsCatalog.noCategoryResultsDescriptionOffline',
    defaultMessage:
      'Nothing in this category is installed on this instance. The marketplace could not be reached, so nothing else can be offered.',
  },
  noFilteredResultsDescription: {
    id: 'PluginsCatalog.noFilteredResultsDescription',
    defaultMessage: 'Try a shorter name, clear the search, or look across all categories.',
  },
  showAllCategories: {
    id: 'PluginsCatalog.showAllCategories',
    defaultMessage: 'Show all categories',
  },
  updating: {
    id: 'PluginsCatalog.updating',
    defaultMessage: 'Updating…',
  },
});

export const PluginsCatalog = ({
  installedPlugins,
  marketplaceInstalled,
  availablePlugins,
  loading = false,
  refreshing = false,
  offline = false,
  failed = false,
  registryHost = null,
  activeCategory,
  query,
  onQueryChange,
  onCategoryReset = () => {},
  onRowAction,
  onRetry = () => {},
  onInstalledItemClick = () => {},
  onAvailableItemClick = () => {},
  justInstalledId = null,
  installingIds = [],
  installFailedId = null,
  productVersion = null,
  configuredPlugins = null,
}) => {
  const { formatMessage } = useIntl();

  // an install can be under way, or have just failed, for a row in either group: an update is
  // the same request as an install, made from the Installed one
  const installState = {
    isInstalling: (registryId) => installingIds.includes(registryId),
    failedRegistryId: installFailedId,
  };
  // the one rule, shared with the plugin page: enforced here rather than trusting the payload
  // to arrive with the block nulled
  const marketplaceTrusted = isMarketplaceTrusted({ offline, failed });
  const installedRows = withInstallState(
    filterRows(
      mergeInstalledRows(
        installedPlugins,
        marketplaceInstalled,
        marketplaceTrusted,
        configuredPlugins,
      ),
      activeCategory,
      query,
    ).sort(sortByGroupAndName),
    installState,
  );

  // nothing can be browsed or installed without a catalogue
  const hideAvailable = !marketplaceTrusted;
  // the available half is the answer the server gave to this query and category, so it is
  // rendered as it arrived; only the locally held installed half is narrowed here
  const availableRows = hideAvailable
    ? []
    : withInstallState(
        availablePlugins.map(toAvailableRow).sort(sortByTierGroupAndName),
        installState,
      );

  // a refetch keeps what is on screen, dimmed, until the answer lands; only a first load, with
  // nothing yet to show, gives the whole list area to the loader
  const busy = loading || refreshing;
  const firstLoad = busy && !refreshing;
  const hasQuery = query.trim().length > 0;
  const hasCategory = activeCategory !== ALL_GROUP_TYPE;
  // an empty screen after a failure is explained by the alert, not by a no-results state
  const isEmpty = !failed && installedRows.length === 0 && availableRows.length === 0;
  // a chip narrows the page just as a query does, so a chip that matches nothing gets the same
  // page-level zero state instead of a blank list that reads as a failed load
  const showZeroState = !busy && isEmpty && (hasQuery || hasCategory);
  const categoryLabel = PLUGINS_FILTER_MESSAGES[activeCategory]
    ? formatMessage(PLUGINS_FILTER_MESSAGES[activeCategory])
    : activeCategory;
  let zeroStateDescription = offline
    ? messages.noSearchResultsDescriptionOffline
    : messages.noSearchResultsDescription;
  if (hasCategory && hasQuery) {
    // names no catalogue, so it holds online and offline alike
    zeroStateDescription = messages.noFilteredResultsDescription;
  } else if (hasCategory) {
    zeroStateDescription = offline
      ? messages.noCategoryResultsDescriptionOffline
      : messages.noCategoryResultsDescription;
  }

  return (
    <div className={cx('plugins-catalog')}>
      {/* the shared search field, not a private FieldText: it already carries the kit's icon,
          the clear affordance and the house sizing. isAlwaysActive because the design keeps the
          field open — the collapsing variant belongs to toolbars, not to a page's own search. */}
      <div className={cx('plugins-catalog-search')} data-automation-id="pluginsSearch">
        <SearchField
          searchValue={query}
          setSearchValue={onQueryChange}
          onFilterChange={() => {}}
          placeholder={formatMessage(messages.searchPlaceholder)}
          isAlwaysActive
        />
      </div>
      {offline && <RegistryOfflineAlert />}
      {failed && <CatalogueUnavailableAlert onRetry={onRetry} />}
      <div
        className={cx('plugins-catalog-list')}
        data-automation-id="catalogList"
        aria-busy={busy}
      >
        {firstLoad ? (
          <div className={cx('plugins-catalog-loader')} data-automation-id="catalogLoader">
            <BubblesLoader />
          </div>
        ) : (
          <>
            {/* over the rows rather than above them, so the list does not jump when it comes and
                goes; the click registered, and nothing flashes away while the answer is awaited */}
            {refreshing && (
              <div
                className={cx('plugins-catalog-refresh-loader')}
                data-automation-id="catalogRefreshLoader"
                role="status"
              >
                <BubblesLoader />
                <span className={cx('plugins-catalog-visually-hidden')}>
                  {formatMessage(messages.updating)}
                </span>
              </div>
            )}
            {/* the Available half is still the answer to the previous chip or query, so the
                whole list is dimmed until the new one arrives; inert, not just pointer-events,
                so a stale Install cannot be reached by Tab and Enter either. React 18 drops a
                boolean `inert` with a warning, so the presence attribute is written as '' */}
            <div
              className={cx('plugins-catalog-groups', { 'plugins-catalog-groups-stale': refreshing })}
              data-automation-id="catalogGroups"
              inert={refreshing ? '' : undefined}
            >
              {/* a group renders only when it has at least one plugin: no heading, no placeholder */}
              {installedRows.length > 0 && (
                <div
                  className={cx('plugins-catalog-group')}
                  data-automation-id="pluginsGroup"
                  data-group={ALL_GROUP_TYPE}
                >
                  {/* no toggle on a catalogue row: enable/disable is local state and lives on the
                      plugin page, where the rest of this plugin's local settings already are */}
                  <PluginsListItems
                    title={ALL_GROUP_TYPE}
                    items={installedRows}
                    onItemClick={onInstalledItemClick}
                    onRowAction={onRowAction}
                    highlightedRegistryId={justInstalledId}
                    productVersion={productVersion}
                  />
                </div>
              )}
              {availableRows.length > 0 && (
                <div
                  className={cx('plugins-catalog-group')}
                  data-automation-id="pluginsGroup"
                  data-group={AVAILABLE_PLUGINS_TYPE}
                >
                  <PluginsListItems
                    title={AVAILABLE_PLUGINS_TYPE}
                    items={availableRows}
                    onItemClick={onAvailableItemClick}
                    onRowAction={onRowAction}
                    productVersion={productVersion}
                  />
                </div>
              )}
            </div>
            {showZeroState && (
              <div
                className={cx('plugins-catalog-empty')}
                data-automation-id={hasQuery ? 'noSearchResults' : 'noCategoryResults'}
              >
                <h3 className={cx('plugins-catalog-empty-title')}>
                  {hasQuery
                    ? formatMessage(messages.noSearchResultsTitle, { query: query.trim() })
                    : formatMessage(messages.noCategoryResultsTitle, { category: categoryLabel })}
                </h3>
                <p className={cx('plugins-catalog-empty-description')}>
                  {formatMessage(zeroStateDescription)}
                </p>
                {/* each action widens one filter; with both set either may be the one that empties
                    the page, and the server answers for the category, so both are offered */}
                <div className={cx('plugins-catalog-empty-actions')}>
                  {hasQuery && (
                    <Button
                      variant="ghost"
                      data-automation-id="clearSearch"
                      onClick={() => onQueryChange('')}
                    >
                      {formatMessage(messages.clearSearch)}
                    </Button>
                  )}
                  {hasCategory && (
                    <Button
                      variant="ghost"
                      data-automation-id="showAllCategories"
                      onClick={onCategoryReset}
                    >
                      {formatMessage(messages.showAllCategories)}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

PluginsCatalog.propTypes = {
  installedPlugins: PropTypes.array.isRequired,
  marketplaceInstalled: PropTypes.array.isRequired,
  availablePlugins: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  /** A request is in flight over rows already on screen: they stay, dimmed, until it settles. */
  refreshing: PropTypes.bool,
  offline: PropTypes.bool,
  failed: PropTypes.bool,
  registryHost: PropTypes.string,
  activeCategory: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  /** Puts the category chips back on All, as the All chip itself does. */
  onCategoryReset: PropTypes.func,
  onRowAction: PropTypes.func.isRequired,
  onRetry: PropTypes.func,
  onInstalledItemClick: PropTypes.func,
  onAvailableItemClick: PropTypes.func,
  /** Registry id of the plugin the last install moved into the Installed group. */
  justInstalledId: PropTypes.string,
  /** Whether an install of this registry id is in flight right now. */
  installingIds: PropTypes.arrayOf(PropTypes.string),
  /** Registry id of the plugin the last install failed for. */
  installFailedId: PropTypes.string,
  /** The ReportPortal release this instance reports, quoted when a row explains a refusal. */
  productVersion: PropTypes.string,
  /** Names of the plugins that have an integration set up. Null when the answer is not known. */
  configuredPlugins: PropTypes.arrayOf(PropTypes.string),
};
