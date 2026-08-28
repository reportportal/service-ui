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
  installMarketplacePluginAction,
  installMarketplacePluginStartAction,
  installMarketplacePluginSuccessAction,
  installMarketplacePluginErrorAction,
} from './actionCreators';
import {
  fetchMarketplaceCatalogue,
  installMarketplacePlugin,
  watchFetchMarketplaceCatalogue,
} from './sagas';
import { FETCH_MARKETPLACE_CATALOGUE_SUCCESS, MARKETPLACE_SEARCH_DEBOUNCE } from './constants';

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

// a saga that throws must fail the test with its own error, not quietly shorten the
// dispatched list; onError replaces redux-saga's logger so the rejection is what surfaces
const run = (saga, action, state = {}) => {
  const dispatched = [];
  return runSaga(
    { dispatch: (a) => dispatched.push(a), getState: () => state, onError: () => {} },
    saga,
    action,
  ).done.then(() => dispatched);
};

// the watcher has to be driven through a store interface, since what is under test is which
// take helper it uses, not what one run of the worker does
const runWatcher = (watcher, state = {}) => {
  const dispatched = [];
  const listeners = [];
  const dispatch = (action) => {
    dispatched.push(action);
    listeners.forEach((listener) => listener(action));
  };

  runSaga(
    {
      subscribe: (listener) => {
        listeners.push(listener);
        return () => {};
      },
      dispatch,
      getState: () => state,
      onError: () => {},
    },
    watcher,
  );

  return { dispatched, dispatch };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const deferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

describe('controllers/plugins/sagas marketplace', () => {
  beforeEach(() => {
    // mockReset, not mockClear: a one-shot response queued by a test must not leak into the next
    fetch.mockReset();
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

    test('hands the filter to the store, which a later refetch reads back', async () => {
      fetch.mockResolvedValue(onlinePayload);

      const dispatched = await run(
        fetchMarketplaceCatalogue,
        fetchMarketplaceCatalogueAction({ q: 'ji ra', category: 'BTS' }),
      );

      expect(dispatched[0]).toEqual(
        fetchMarketplaceCatalogueStartAction({ q: 'ji ra', category: 'BTS' }),
      );
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

      expect(dispatched[0]).toEqual(fetchMarketplaceCatalogueStartAction());
      expect(dispatched).toContainEqual(fetchMarketplaceCatalogueErrorAction('Network Error'));
    });

    test('a debounced request does not leave on the keystroke that asked for it', async () => {
      jest.useFakeTimers();
      fetch.mockResolvedValue(onlinePayload);
      const done = run(
        fetchMarketplaceCatalogue,
        fetchMarketplaceCatalogueAction({ q: 'j', debounced: true }),
      );

      await Promise.resolve();
      expect(fetch).not.toHaveBeenCalled();

      jest.advanceTimersByTime(MARKETPLACE_SEARCH_DEBOUNCE);
      const dispatched = await done;

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins?q=j');
      // nothing is announced to the store until the request actually leaves
      expect(dispatched[0]).toEqual(fetchMarketplaceCatalogueStartAction({ q: 'j' }));
      jest.useRealTimers();
    });

    test('an undebounced request leaves immediately', async () => {
      fetch.mockResolvedValue(onlinePayload);

      await run(fetchMarketplaceCatalogue, fetchMarketplaceCatalogueAction({ q: 'j' }));

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins?q=j');
    });

    // a failed catalogue must never be as quiet as an empty one
    test('a transport failure is reported, like every other failed request here', async () => {
      const error = new Error('Network Error');
      fetch.mockRejectedValue(error);

      const dispatched = await run(fetchMarketplaceCatalogue, fetchMarketplaceCatalogueAction());

      expect(dispatched).toContainEqual(showDefaultErrorNotification(error));
    });

    test('a slow response cannot overwrite a newer one', async () => {
      const slow = deferred();
      const fast = deferred();
      fetch.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);
      const { dispatched, dispatch } = runWatcher(watchFetchMarketplaceCatalogue);

      dispatch(fetchMarketplaceCatalogueAction({ q: 'ji' }));
      await settle();
      dispatch(fetchMarketplaceCatalogueAction({ q: 'jira' }));
      await settle();

      fast.resolve(onlinePayload);
      await settle();
      slow.resolve(offlinePayload);
      await settle();

      expect(dispatched.filter(({ type }) => type === FETCH_MARKETPLACE_CATALOGUE_SUCCESS)).toEqual(
        [fetchMarketplaceCatalogueSuccessAction(onlinePayload)],
      );
    });
  });

  describe('installMarketplacePlugin', () => {
    test('posts the requested version, which the endpoint requires', async () => {
      fetch.mockResolvedValue({});

      await run(installMarketplacePlugin, installMarketplacePluginAction('slack', '1.2.0'));

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/slack/install', {
        method: 'post',
        data: { version: '1.2.0' },
      });
    });

    // install, update and rollback are the same request, differing only by version
    test('posts the older version asked for on a rollback', async () => {
      fetch.mockResolvedValue({});

      await run(installMarketplacePlugin, installMarketplacePluginAction('slack', '0.9.0'));

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/slack/install', {
        method: 'post',
        data: { version: '0.9.0' },
      });
    });

    test('refetches the catalogue on success', async () => {
      fetch.mockResolvedValue({});

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '1.2.0'),
      );

      expect(dispatched).toEqual([
        installMarketplacePluginStartAction('slack'),
        installMarketplacePluginSuccessAction('slack'),
        fetchMarketplaceCatalogueAction({ q: null, category: null }),
      ]);
    });

    test('the refetch keeps the filter the catalogue was last loaded with', async () => {
      fetch.mockResolvedValue({});

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '1.2.0'),
        { plugins: { marketplace: { query: { q: 'ji ra', category: 'BTS' }, installing: [] } } },
      );

      expect(dispatched).toContainEqual(
        fetchMarketplaceCatalogueAction({ q: 'ji ra', category: 'BTS' }),
      );
    });

    test('a failed install is reported and does not refetch', async () => {
      fetch.mockRejectedValue(new Error('Forbidden'));

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '1.2.0'),
      );

      expect(dispatched).toEqual([
        installMarketplacePluginStartAction('slack'),
        installMarketplacePluginErrorAction('slack', 'Forbidden'),
        showDefaultErrorNotification(new Error('Forbidden')),
      ]);
    });
  });
});
