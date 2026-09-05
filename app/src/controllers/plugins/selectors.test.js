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

import catalogue from './__fixtures__/catalogue.json';
import catalogueOffline from './__fixtures__/catalogue-offline.json';
import { MARKETPLACE_CATALOGUE_STATE } from './constants';
import {
  marketplaceCatalogueStateSelector,
  marketplaceInstalledPluginsSelector,
  marketplaceAvailablePluginsSelector,
  marketplaceRegistrySelector,
  marketplaceRegistryHostSelector,
  marketplaceCatalogueLoadingSelector,
  isMarketplaceRegistryOfflineSelector,
  hasMarketplaceCatalogueFailedSelector,
  marketplaceCatalogueErrorSelector,
  marketplacePluginUpdateVersionSelector,
  hasMarketplacePluginUpdateSelector,
  isMarketplacePluginInstallingSelector,
  marketplaceCatalogueQuerySelector,
} from './selectors';

// jira carries an update, rally a marketplace block without one, custom-scanner no block at all
const { installed, available, registry } = catalogue;

const mockState = (marketplace) => ({ plugins: { marketplace } });

const loadedOnline = mockState({
  catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE,
  registry,
  installed,
  available,
  error: null,
  installing: ['slack'],
});

const loadedOffline = mockState({
  catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE,
  registry: catalogueOffline.registry,
  installed: catalogueOffline.installed,
  available: catalogueOffline.available,
  error: null,
  installing: [],
});

describe('controllers/plugins/marketplace selectors', () => {
  test('report the not-requested state when nothing is in the store yet', () => {
    expect(marketplaceCatalogueStateSelector({})).toBe(MARKETPLACE_CATALOGUE_STATE.NOT_REQUESTED);
    expect(marketplaceInstalledPluginsSelector({})).toEqual([]);
    expect(marketplaceAvailablePluginsSelector({})).toEqual([]);
  });

  test('expose the installed and available lists', () => {
    expect(marketplaceInstalledPluginsSelector(loadedOnline)).toEqual(installed);
    expect(marketplaceAvailablePluginsSelector(loadedOnline)).toEqual(available);
  });

  test('expose the registry status and host', () => {
    expect(marketplaceRegistrySelector(loadedOnline)).toEqual(registry);
    expect(marketplaceRegistryHostSelector(loadedOffline)).toBe(registry.host);
  });

  test('loading is true only while the request is in flight', () => {
    expect(marketplaceCatalogueLoadingSelector(loadedOnline)).toBe(false);
    expect(
      marketplaceCatalogueLoadingSelector(
        mockState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADING }),
      ),
    ).toBe(true);
    expect(marketplaceCatalogueLoadingSelector({})).toBe(false);
  });

  test('offline is a loaded state, not the failed one', () => {
    expect(isMarketplaceRegistryOfflineSelector(loadedOffline)).toBe(true);
    expect(isMarketplaceRegistryOfflineSelector(loadedOnline)).toBe(false);
    expect(
      isMarketplaceRegistryOfflineSelector(
        mockState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED, error: 'boom' }),
      ),
    ).toBe(false);
    expect(marketplaceCatalogueErrorSelector(loadedOffline)).toBeNull();
  });

  test('a failed request is its own state, distinct from offline and from a fresh store', () => {
    expect(
      hasMarketplaceCatalogueFailedSelector(
        mockState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED, error: 'boom' }),
      ),
    ).toBe(true);
    expect(hasMarketplaceCatalogueFailedSelector(loadedOffline)).toBe(false);
    expect(hasMarketplaceCatalogueFailedSelector(loadedOnline)).toBe(false);
    expect(hasMarketplaceCatalogueFailedSelector({})).toBe(false);
  });

  test('surface the error of a failed request', () => {
    expect(
      marketplaceCatalogueErrorSelector(
        mockState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED, error: 'boom' }),
      ),
    ).toBe('boom');
  });

  test('an update is available only when the registry offered a newer version', () => {
    expect(marketplacePluginUpdateVersionSelector(loadedOnline, 'jira')).toBe('1.6.0');
    expect(hasMarketplacePluginUpdateSelector(loadedOnline, 'jira')).toBe(true);
    expect(hasMarketplacePluginUpdateSelector(loadedOnline, 'rally')).toBe(false);
    expect(hasMarketplacePluginUpdateSelector(loadedOnline, 'custom-scanner')).toBe(false);
    expect(hasMarketplacePluginUpdateSelector(loadedOnline, 'unknown')).toBe(false);
  });

  test('no plugin has an update while the registry is offline', () => {
    expect(marketplacePluginUpdateVersionSelector(loadedOffline, 'jira')).toBeNull();
    expect(hasMarketplacePluginUpdateSelector(loadedOffline, 'jira')).toBe(false);
  });

  test('expose the filter the catalogue was last requested with', () => {
    expect(
      marketplaceCatalogueQuerySelector(mockState({ query: { q: 'ji', category: 'BTS' } })),
    ).toEqual({ q: 'ji', category: 'BTS' });
    expect(marketplaceCatalogueQuerySelector({})).toEqual({ q: null, category: null });
  });

  test('track which plugin is being installed', () => {
    expect(isMarketplacePluginInstallingSelector(loadedOnline, 'slack')).toBe(true);
    expect(isMarketplacePluginInstallingSelector(loadedOnline, 'telegram')).toBe(false);
    expect(isMarketplacePluginInstallingSelector({}, 'slack')).toBe(false);
  });
});
