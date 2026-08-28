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

import { runSaga } from 'redux-saga';
import { fetch } from 'common/utils';
import { showDefaultErrorNotification } from 'controllers/notification';
import {
  fetchMarketplaceCatalogueAction,
  fetchMarketplaceCatalogueStartAction,
  fetchMarketplaceCatalogueSuccessAction,
  fetchMarketplaceCatalogueErrorAction,
  installMarketplacePluginStartAction,
  installMarketplacePluginSuccessAction,
  installMarketplacePluginErrorAction,
} from './actionCreators';
import { fetchMarketplaceCatalogue, installMarketplacePlugin } from './sagas';

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  fetch: jest.fn(),
}));

const onlinePayload = {
  registry: { status: 'ONLINE', host: 'registry.reportportal.io' },
  installed: [{ name: 'jira', version: '5.0.0' }],
  available: [{ id: 'slack', name: 'Slack' }],
};

const offlinePayload = {
  registry: { status: 'OFFLINE', host: 'registry.reportportal.io' },
  installed: [{ name: 'jira', version: '5.0.0', marketplace: null }],
  available: [],
};

const run = (saga, action) => {
  const dispatched = [];
  return runSaga({ dispatch: (a) => dispatched.push(a), getState: () => ({}) }, saga, action)
    .done.then(() => dispatched)
    .catch(() => dispatched);
};

describe('controllers/plugins/sagas marketplace', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchMarketplaceCatalogue', () => {
    test('requests the catalogue and dispatches the payload on success', async () => {
      fetch.mockResolvedValue(onlinePayload);

      const dispatched = await run(fetchMarketplaceCatalogue, fetchMarketplaceCatalogueAction());

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins');
      expect(dispatched).toEqual([
        fetchMarketplaceCatalogueStartAction(),
        fetchMarketplaceCatalogueSuccessAction(onlinePayload),
      ]);
    });

    test('passes the query and the category to the endpoint', async () => {
      fetch.mockResolvedValue(onlinePayload);

      await run(
        fetchMarketplaceCatalogue,
        fetchMarketplaceCatalogueAction({ q: 'ji ra', category: 'BTS' }),
      );

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins?q=ji%20ra&category=BTS');
    });

    test('omits empty filters from the request', async () => {
      fetch.mockResolvedValue(onlinePayload);

      await run(
        fetchMarketplaceCatalogue,
        fetchMarketplaceCatalogueAction({ q: '', category: '' }),
      );

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins');
    });

    test('an OFFLINE payload is a success, not an error', async () => {
      fetch.mockResolvedValue(offlinePayload);

      const dispatched = await run(fetchMarketplaceCatalogue, fetchMarketplaceCatalogueAction());

      expect(dispatched).toEqual([
        fetchMarketplaceCatalogueStartAction(),
        fetchMarketplaceCatalogueSuccessAction(offlinePayload),
      ]);
    });

    test('a transport failure dispatches the error action', async () => {
      fetch.mockRejectedValue(new Error('Network Error'));

      const dispatched = await run(fetchMarketplaceCatalogue, fetchMarketplaceCatalogueAction());

      expect(dispatched).toEqual([
        fetchMarketplaceCatalogueStartAction(),
        fetchMarketplaceCatalogueErrorAction('Network Error'),
      ]);
    });
  });

  describe('installMarketplacePlugin', () => {
    test('posts to the install endpoint and refetches the catalogue', async () => {
      fetch.mockResolvedValue({});

      const dispatched = await run(installMarketplacePlugin, {
        payload: { registryId: 'slack' },
      });

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/slack/install', { method: 'post' });
      expect(dispatched).toEqual([
        installMarketplacePluginStartAction('slack'),
        installMarketplacePluginSuccessAction('slack'),
        fetchMarketplaceCatalogueAction(),
      ]);
    });

    test('a failed install is reported and does not refetch', async () => {
      fetch.mockRejectedValue(new Error('Forbidden'));

      const dispatched = await run(installMarketplacePlugin, {
        payload: { registryId: 'slack' },
      });

      expect(dispatched).toEqual([
        installMarketplacePluginStartAction('slack'),
        installMarketplacePluginErrorAction('slack', 'Forbidden'),
        showDefaultErrorNotification(new Error('Forbidden')),
      ]);
    });
  });
});
