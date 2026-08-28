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

import { MARKETPLACE_CATALOGUE_STATE } from './constants';
import {
  fetchMarketplaceCatalogueStartAction,
  fetchMarketplaceCatalogueSuccessAction,
  fetchMarketplaceCatalogueErrorAction,
  installMarketplacePluginStartAction,
  installMarketplacePluginSuccessAction,
  installMarketplacePluginErrorAction,
} from './actionCreators';
import { marketplaceReducer } from './reducer';

const onlinePayload = {
  registry: { status: 'ONLINE', host: 'registry.reportportal.io' },
  installed: [{ name: 'jira', version: '5.0.0' }],
  available: [{ id: 'slack', name: 'Slack', latestVersion: '1.0.0' }],
};

const offlinePayload = {
  registry: { status: 'OFFLINE', host: 'registry.reportportal.io' },
  installed: [{ name: 'jira', version: '5.0.0', marketplace: null }],
  available: [],
};

describe('controllers/plugins/marketplaceReducer', () => {
  test('starts in the not-requested state with empty lists', () => {
    const state = marketplaceReducer(undefined, {});

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.NOT_REQUESTED);
    expect(state.installed).toEqual([]);
    expect(state.available).toEqual([]);
    expect(state.registry).toEqual({ status: null, host: null });
    expect(state.error).toBeNull();
    expect(state.installing).toEqual([]);
    expect(state.query).toEqual({ q: null, category: null });
  });

  test('moves to the in-flight state and drops a previous error on fetch start', () => {
    const failed = marketplaceReducer(undefined, fetchMarketplaceCatalogueErrorAction('boom'));
    const state = marketplaceReducer(failed, fetchMarketplaceCatalogueStartAction());

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADING);
    expect(state.error).toBeNull();
  });

  test('stores an ONLINE payload as loaded-online', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction(onlinePayload),
    );

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE);
    expect(state.registry).toEqual({ status: 'ONLINE', host: 'registry.reportportal.io' });
    expect(state.installed).toEqual(onlinePayload.installed);
    expect(state.available).toEqual(onlinePayload.available);
    expect(state.error).toBeNull();
  });

  test('stores an OFFLINE payload as loaded-offline, keeping the host and the installed list', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction(offlinePayload),
    );

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE);
    expect(state.registry.host).toBe('registry.reportportal.io');
    expect(state.installed).toEqual(offlinePayload.installed);
    expect(state.error).toBeNull();
  });

  test('treats an unrecognised registry status as not online', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction({
        registry: { status: 'DEGRADED', host: 'registry.reportportal.io' },
        installed: [],
        available: [],
      }),
    );

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE);
  });

  test('treats a missing registry block as not online', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction({ installed: [], available: [] }),
    );

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE);
  });

  test('remembers the filter a fetch was started with', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueStartAction({ q: 'ji ra', category: 'BTS' }),
    );

    expect(state.query).toEqual({ q: 'ji ra', category: 'BTS' });
  });

  test('an unfiltered fetch clears the remembered filter', () => {
    const filtered = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueStartAction({ q: 'ji ra', category: 'BTS' }),
    );
    const state = marketplaceReducer(filtered, fetchMarketplaceCatalogueStartAction());

    expect(state.query).toEqual({ q: null, category: null });
  });

  test('keeps the remembered filter across a success so a refetch can reuse it', () => {
    const started = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueStartAction({ q: 'ji ra', category: 'BTS' }),
    );
    const state = marketplaceReducer(
      started,
      fetchMarketplaceCatalogueSuccessAction(onlinePayload),
    );

    expect(state.query).toEqual({ q: 'ji ra', category: 'BTS' });
  });

  test('defaults missing lists to empty arrays', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction({ registry: { status: 'ONLINE', host: 'h' } }),
    );

    expect(state.installed).toEqual([]);
    expect(state.available).toEqual([]);
  });

  test('a transport failure clears the catalogue and records the error', () => {
    const loaded = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction(onlinePayload),
    );
    const state = marketplaceReducer(loaded, fetchMarketplaceCatalogueErrorAction('Network Error'));

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.FAILED);
    expect(state.error).toBe('Network Error');
    expect(state.installed).toEqual([]);
    expect(state.available).toEqual([]);
  });

  test('tracks in-flight installs by registry id', () => {
    const state = marketplaceReducer(undefined, installMarketplacePluginStartAction('slack'));

    expect(state.installing).toEqual(['slack']);
  });

  test('clears the install flag on success', () => {
    const started = marketplaceReducer(undefined, installMarketplacePluginStartAction('slack'));
    const state = marketplaceReducer(started, installMarketplacePluginSuccessAction('slack'));

    expect(state.installing).toEqual([]);
  });

  test('clears only the failed install flag on error', () => {
    let state = marketplaceReducer(undefined, installMarketplacePluginStartAction('slack'));
    state = marketplaceReducer(state, installMarketplacePluginStartAction('telegram'));
    state = marketplaceReducer(state, installMarketplacePluginErrorAction('slack', 'nope'));

    expect(state.installing).toEqual(['telegram']);
    expect(state.installError).toEqual({ registryId: 'slack', error: 'nope' });
  });
});
