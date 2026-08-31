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
import { INSTALLED_GROUP_TYPE } from 'common/constants/pluginsFilter';
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
});

export const PluginsCatalog = ({
  installedPlugins,
  marketplaceInstalled,
  availablePlugins,
  loading = false,
  offline = false,
  failed = false,
  registryHost = null,
  activeCategory,
  query,
  onQueryChange,
  onRowAction,
  onRetry = () => {},
  onInstalledItemClick = () => {},
  onAvailableItemClick = () => {},
  justInstalledId = null,
}) => {
  const { formatMessage } = useIntl();

  // the one rule, shared with the plugin page: enforced here rather than trusting the payload
  // to arrive with the block nulled
  const marketplaceTrusted = isMarketplaceTrusted({ offline, failed });
  const installedRows = filterRows(
    mergeInstalledRows(installedPlugins, marketplaceInstalled, marketplaceTrusted),
    activeCategory,
    query,
  ).sort(sortByGroupAndName);

  // nothing can be browsed or installed without a catalogue, and the Installed chip asks for
  // installed only
  const hideAvailable = !marketplaceTrusted || activeCategory === INSTALLED_GROUP_TYPE;
  // the available half is the answer the server gave to this query and category, so it is
  // rendered as it arrived; only the locally held installed half is narrowed here
  const availableRows = hideAvailable
    ? []
    : availablePlugins.map(toAvailableRow).sort(sortByTierGroupAndName);

  const hasQuery = query.trim().length > 0;
  // an empty screen after a failure is explained by the alert, not by a no-results state
  const isEmpty = !failed && installedRows.length === 0 && availableRows.length === 0;

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
      {offline && <RegistryOfflineAlert host={registryHost} />}
      {failed && <CatalogueUnavailableAlert onRetry={onRetry} />}
      {loading ? (
        <div className={cx('plugins-catalog-loader')} data-automation-id="catalogLoader">
          <BubblesLoader />
        </div>
      ) : (
        <>
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
              />
            </div>
          )}
          {isEmpty && hasQuery && (
            <div className={cx('plugins-catalog-empty')} data-automation-id="noSearchResults">
              <h3 className={cx('plugins-catalog-empty-title')}>
                {formatMessage(messages.noSearchResultsTitle, { query: query.trim() })}
              </h3>
              <p className={cx('plugins-catalog-empty-description')}>
                {formatMessage(messages.noSearchResultsDescription)}
              </p>
              <Button
                variant="ghost"
                data-automation-id="clearSearch"
                onClick={() => onQueryChange('')}
              >
                {formatMessage(messages.clearSearch)}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

PluginsCatalog.propTypes = {
  installedPlugins: PropTypes.array.isRequired,
  marketplaceInstalled: PropTypes.array.isRequired,
  availablePlugins: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  offline: PropTypes.bool,
  failed: PropTypes.bool,
  registryHost: PropTypes.string,
  activeCategory: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onRowAction: PropTypes.func.isRequired,
  onRetry: PropTypes.func,
  onInstalledItemClick: PropTypes.func,
  onAvailableItemClick: PropTypes.func,
  /** Registry id of the plugin the last install moved into the Installed group. */
  justInstalledId: PropTypes.string,
};
