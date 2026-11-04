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
  marketplaceCatalogueRefreshingSelector,
  isMarketplaceRegistryOfflineSelector,
  hasMarketplaceCatalogueFailedSelector,
  marketplaceCatalogueErrorSelector,
  marketplacePluginUpdateVersionSelector,
  hasMarketplacePluginUpdateSelector,
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

  test('refreshing is a request in flight over an answer that is already on screen', () => {
    const loading = { catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADING };

    // the first request, and a retry after a failure: nothing has been answered yet
    expect(marketplaceCatalogueRefreshingSelector(mockState(loading))).toBe(false);
    expect(
      marketplaceCatalogueRefreshingSelector(mockState({ ...loading, answered: false, available })),
    ).toBe(false);
    // a refetch over an answer, including an empty one (a zero state is an answer too)
    expect(
      marketplaceCatalogueRefreshingSelector(mockState({ ...loading, answered: true, available })),
    ).toBe(true);
    expect(
      marketplaceCatalogueRefreshingSelector(
        mockState({ ...loading, answered: true, installed: [], available: [] }),
      ),
    ).toBe(true);
    // settled is not refreshing, whatever the store holds
    expect(
      marketplaceCatalogueRefreshingSelector(
        mockState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE, answered: true }),
      ),
    ).toBe(false);
    expect(marketplaceCatalogueRefreshingSelector({})).toBe(false);
  });

  // spec rule 5: nothing marketplace-sourced is trusted while offline, and a refetch in flight
  // has not yet said otherwise
  test('a refetch over an offline answer stays offline until the next answer lands', () => {
    const refetch = (registryState) =>
      mockState({
        catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADING,
        answered: true,
        registry: registryState,
      });

    expect(isMarketplaceRegistryOfflineSelector(refetch(catalogueOffline.registry))).toBe(true);
    // a missing status was offline when it landed, and stays so
    expect(isMarketplaceRegistryOfflineSelector(refetch({ status: null, host: null }))).toBe(true);
    expect(isMarketplaceRegistryOfflineSelector(refetch(registry))).toBe(false);
    // a first load has no verdict to carry
    expect(
      isMarketplaceRegistryOfflineSelector(
        mockState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADING, registry: {} }),
      ),
    ).toBe(false);
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

});
