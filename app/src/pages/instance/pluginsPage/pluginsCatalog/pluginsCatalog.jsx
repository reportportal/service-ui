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
import Parser from 'html-react-parser';
import { BubblesLoader, Button, FieldText } from '@reportportal/ui-kit';
import { ALL_GROUP_TYPE, AVAILABLE_PLUGINS_TYPE } from 'common/constants/pluginsGroupTypes';
import { INSTALLED_GROUP_TYPE } from 'common/constants/pluginsFilter';
import SearchIcon from 'common/img/search-icon-inline.svg';
import { PluginsListItems } from '../pluginsListItems';
import { RegistryOfflineAlert } from '../registryOfflineAlert';
import {
  filterRows,
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
  registryHost = null,
  activeCategory,
  query,
  onQueryChange,
  onRowAction,
  onInstalledItemClick = () => {},
  onAvailableItemClick = () => {},
  onToggleActive = () => Promise.resolve(),
  showToggleConfirmationModal = () => {},
}) => {
  const { formatMessage } = useIntl();

  const installedRows = filterRows(
    mergeInstalledRows(installedPlugins, marketplaceInstalled),
    activeCategory,
    query,
  ).sort(sortByGroupAndName);

  // offline nothing can be browsed or installed, and the Installed chip asks for installed only
  const hideAvailable = offline || activeCategory === INSTALLED_GROUP_TYPE;
  const availableRows = hideAvailable
    ? []
    : filterRows(availablePlugins.map(toAvailableRow), activeCategory, query).sort(
        sortByTierGroupAndName,
      );

  const hasQuery = query.trim().length > 0;
  const isEmpty = installedRows.length === 0 && availableRows.length === 0;

  return (
    <div className={cx('plugins-catalog')}>
      <div className={cx('plugins-catalog-search')} data-automation-id="pluginsSearch">
        <FieldText
          value={query}
          placeholder={formatMessage(messages.searchPlaceholder)}
          startIcon={Parser(SearchIcon)}
          clearable
          onChange={(event) => onQueryChange(event.target.value)}
          onClear={() => onQueryChange('')}
        />
      </div>
      {offline && <RegistryOfflineAlert host={registryHost} />}
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
              <PluginsListItems
                title={ALL_GROUP_TYPE}
                items={installedRows}
                onItemClick={onInstalledItemClick}
                onToggleActive={onToggleActive}
                onRowAction={onRowAction}
                showToggleConfirmationModal={showToggleConfirmationModal}
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
  registryHost: PropTypes.string,
  activeCategory: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onRowAction: PropTypes.func.isRequired,
  onInstalledItemClick: PropTypes.func,
  onAvailableItemClick: PropTypes.func,
  onToggleActive: PropTypes.func,
  showToggleConfirmationModal: PropTypes.func,
};
