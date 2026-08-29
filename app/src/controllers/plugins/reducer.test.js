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
import pluginDetail from './__fixtures__/plugin-detail.json';
import pluginDetailOffline from './__fixtures__/plugin-detail-offline.json';
import { MARKETPLACE_CATALOGUE_STATE } from './constants';
import {
  fetchMarketplaceCatalogueStartAction,
  fetchMarketplaceCatalogueSuccessAction,
  fetchMarketplaceCatalogueErrorAction,
  installMarketplacePluginStartAction,
  installMarketplacePluginSuccessAction,
  installMarketplacePluginErrorAction,
  fetchMarketplaceLicenceSuccessAction,
} from './actionCreators';
import {
  marketplaceReducer,
  marketplacePluginDetailReducer,
  marketplaceLicenceReducer,
} from './reducer';

// the two catalogue bodies service-api really sends
const onlinePayload = catalogue;
const offlinePayload = catalogueOffline;
const REGISTRY_HOST = catalogue.registry.host;

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
    expect(state.registry).toEqual({ status: 'ONLINE', host: REGISTRY_HOST });
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
    expect(state.registry.host).toBe(REGISTRY_HOST);
    expect(state.installed).toEqual(offlinePayload.installed);
    expect(state.error).toBeNull();
  });

  test('treats an unrecognised registry status as not online', () => {
    const state = marketplaceReducer(
      undefined,
      fetchMarketplaceCatalogueSuccessAction({
        ...onlinePayload,
        registry: { status: 'DEGRADED', host: REGISTRY_HOST },
      }),
    );

    expect(state.catalogueState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE);
  });

  test('treats a missing registry block as not online', () => {
    const state = marketplaceReducer(
      undefined,
      // a body no route sends: the envelope is contracted, but the UI may not lean on it
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
      fetchMarketplaceCatalogueSuccessAction({ registry: catalogue.registry }),
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

describe('controllers/plugins/marketplacePluginDetailReducer', () => {
  const onlineDetail = pluginDetail;

  test('an ONLINE answer keeps the registry half', () => {
    const state = marketplacePluginDetailReducer(undefined, {
      type: 'fetchMarketplacePluginDetailSuccess',
      payload: onlineDetail,
    });

    expect(state.detailState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE);
    expect(state.versions).toEqual(onlineDetail.versions);
    expect(state.advisory).toEqual(onlineDetail.advisory);
    expect(state.screenshots).toEqual(onlineDetail.screenshots);
  });

  // an OFFLINE answer is a success whose registry half is simply not knowable
  test('an OFFLINE answer keeps nothing registry-derived, whatever the payload carries', () => {
    const state = marketplacePluginDetailReducer(undefined, {
      type: 'fetchMarketplacePluginDetailSuccess',
      payload: { ...onlineDetail, registry: pluginDetailOffline.registry },
    });

    expect(state.detailState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE);
    expect(state.plugin).toBeNull();
    expect(state.versions).toEqual([]);
    expect(state.changelog).toBeNull();
    expect(state.screenshots).toEqual([]);
    expect(state.advisory).toBeNull();
    expect(state.registry.host).toBe(REGISTRY_HOST);
  });

  test('an unknown registry status degrades to the cautious side', () => {
    const state = marketplacePluginDetailReducer(undefined, {
      type: 'fetchMarketplacePluginDetailSuccess',
      payload: { ...onlineDetail, registry: { status: 'DEGRADED', host: REGISTRY_HOST } },
    });

    expect(state.detailState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE);
    expect(state.advisory).toBeNull();
  });

  // opening a second plugin must not show the first one's advisory for even a frame
  test("a new request drops the previous plugin's registry half", () => {
    const loaded = marketplacePluginDetailReducer(undefined, {
      type: 'fetchMarketplacePluginDetailSuccess',
      payload: onlineDetail,
    });
    const state = marketplacePluginDetailReducer(loaded, {
      type: 'fetchMarketplacePluginDetailStart',
      payload: 'plugin-notify-slack',
    });

    expect(state.detailState).toBe(MARKETPLACE_CATALOGUE_STATE.LOADING);
    expect(state.registryId).toBe('plugin-notify-slack');
    expect(state.advisory).toBeNull();
    expect(state.versions).toEqual([]);
  });

  test('a failed request keeps nothing but the failure', () => {
    const loaded = marketplacePluginDetailReducer(undefined, {
      type: 'fetchMarketplacePluginDetailSuccess',
      payload: onlineDetail,
    });
    const state = marketplacePluginDetailReducer(loaded, {
      type: 'fetchMarketplacePluginDetailError',
      payload: 'Bad Gateway',
    });

    expect(state.detailState).toBe(MARKETPLACE_CATALOGUE_STATE.FAILED);
    expect(state.error).toBe('Bad Gateway');
    expect(state.versions).toEqual([]);
    expect(state.advisory).toBeNull();
  });
});

describe('controllers/plugins/fetchMarketplaceLicenceSuccessAction', () => {
  // the last line of defence: whatever a response or a caller carries, the action that reaches
  // the store is built out of the two fields the endpoint is contracted to answer
  test('carries only whether credentials exist and who they sign as', () => {
    const action = fetchMarketplaceLicenceSuccessAction({
      configured: true,
      customerId: 'acme',
      privateKey: 'c2VjcmV0',
    });

    expect(action.payload).toEqual({ configured: true, customerId: 'acme' });
  });

  test('an absent customer id is null rather than undefined', () => {
    expect(fetchMarketplaceLicenceSuccessAction({ configured: false }).payload).toEqual({
      configured: false,
      customerId: null,
    });
  });
});

describe('controllers/plugins/marketplaceLicenceReducer', () => {
  test('stores whether credentials exist and who they sign as', () => {
    const state = marketplaceLicenceReducer(undefined, {
      type: 'fetchMarketplaceLicenceSuccess',
      payload: { configured: true, customerId: 'acme' },
    });

    expect(state).toEqual({ configured: true, customerId: 'acme', loading: false, error: null });
  });

  // there is no endpoint that returns a key and there must be no state that could hold one
  test('a key smuggled into the payload is not kept', () => {
    const state = marketplaceLicenceReducer(undefined, {
      type: 'fetchMarketplaceLicenceSuccess',
      payload: { configured: true, customerId: 'acme', privateKey: 'c2VjcmV0' },
    });

    expect(JSON.stringify(state)).not.toContain('c2VjcmV0');
  });

  test('the submit action itself never reaches the store', () => {
    const before = marketplaceLicenceReducer(undefined, { type: '@@INIT' });
    const after = marketplaceLicenceReducer(before, {
      type: 'setMarketplaceLicence',
      payload: { customerId: 'acme', privateKey: 'c2VjcmV0' },
    });

    expect(after).toBe(before);
  });
});
