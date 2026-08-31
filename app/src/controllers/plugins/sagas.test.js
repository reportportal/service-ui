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
import {
  showDefaultErrorNotification,
  showNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import catalogue from './__fixtures__/catalogue.json';
import catalogueOffline from './__fixtures__/catalogue-offline.json';
import pluginDetail from './__fixtures__/plugin-detail.json';
import installRequest from './__fixtures__/install-request.json';
import licenceRequest from './__fixtures__/licence-request.json';
import requestConstraints from './__fixtures__/request-constraints.json';
import {
  fetchMarketplaceCatalogueAction,
  fetchMarketplaceCatalogueStartAction,
  fetchMarketplaceCatalogueSuccessAction,
  fetchMarketplaceCatalogueErrorAction,
  installMarketplacePluginAction,
  installMarketplacePluginStartAction,
  installMarketplacePluginSuccessAction,
  installMarketplacePluginErrorAction,
  fetchMarketplacePluginDetailAction,
  fetchMarketplacePluginDetailStartAction,
  fetchMarketplacePluginDetailSuccessAction,
  fetchMarketplacePluginDetailErrorAction,
  fetchMarketplaceLicenceAction,
  fetchMarketplaceLicenceSuccessAction,
  setMarketplaceLicenceAction,
  deleteMarketplaceLicenceAction,
  marketplaceLicenceStartAction,
  marketplaceLicenceErrorAction,
} from './actionCreators';
import {
  fetchMarketplaceCatalogue,
  installMarketplacePlugin,
  watchFetchMarketplaceCatalogue,
  fetchMarketplacePluginDetail,
  watchFetchMarketplacePluginDetail,
  fetchMarketplaceLicence,
  setMarketplaceLicence,
  deleteMarketplaceLicence,
} from './sagas';
import {
  FETCH_MARKETPLACE_CATALOGUE_SUCCESS,
  FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS,
  MARKETPLACE_SEARCH_DEBOUNCE,
  MARKETPLACE_LICENCE_MAX_LENGTHS,
} from './constants';

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  fetch: jest.fn(),
}));

// the bodies the routes really answer with; the saga is transport and passes them through whole
const onlinePayload = catalogue;
const offlinePayload = catalogueOffline;

// the body of the request the saga made, so a field name can be compared against the shape
// service-api publishes rather than against a literal written on this side
const sentBody = () => fetch.mock.calls[0][1].data;

// the four values the published constraints say every mandatory string field refuses
const REFUSED_VALUES = [undefined, null, '', '   '];

// a notification action carries a timestamped uid, so it is compared by what it says
const notifications = (dispatched) =>
  dispatched
    .filter((action) => action.type === 'showNotification')
    .map(({ payload }) => ({ messageId: payload.messageId, type: payload.type }));

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

// captured before any test can install fake timers, so a leak is detectable by identity
const NATIVE_SET_TIMEOUT = setTimeout;

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

  // a test that installs fake timers cannot be trusted to take them down again: a failing
  // assertion returns first, and every test after it then runs with time stopped
  afterEach(() => {
    jest.useRealTimers();
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
    });

    // the debounce test installs fake timers; a failing assertion above returns before any
    // in-test restore, so the restore has to be an afterEach or the whole file below runs faked
    test('the debounce test leaves real timers behind', () => {
      expect(setTimeout).toBe(NATIVE_SET_TIMEOUT);
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
    const installConstraints = requestConstraints['install-request.json'].fields;

    test('posts the requested version, which the endpoint requires', async () => {
      fetch.mockResolvedValue({});

      await run(installMarketplacePlugin, installMarketplacePluginAction('slack', '1.2.0'));

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/slack/install', {
        method: 'post',
        data: { ...installRequest, version: '1.2.0' },
      });
    });

    // the names are taken from the body service-api publishes as accepted, not from a literal
    // agreed on here: a field this side invents is a 400 nobody sees until it is deployed
    test('posts exactly the field names the endpoint accepts', async () => {
      fetch.mockResolvedValue({});

      await run(installMarketplacePlugin, installMarketplacePluginAction('slack', '1.2.0'));

      expect(Object.keys(sentBody())).toEqual(Object.keys(installRequest));
    });

    // install, update and rollback are the same request, differing only by version
    test('posts the older version asked for on a rollback', async () => {
      fetch.mockResolvedValue({});

      await run(installMarketplacePlugin, installMarketplacePluginAction('slack', '0.9.0'));

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/slack/install', {
        method: 'post',
        data: { ...installRequest, version: '0.9.0' },
      });
    });

    test('the published constraint on version is that it is required and never blank', () => {
      expect(installConstraints.version).toMatchObject({
        mandatory: true,
        refusesEmpty: true,
        refusesBlank: true,
      });
    });

    // a row whose version the registry never stated is a body service-api refuses with a 400
    // before the handler runs, so it never leaves: the round trip could only come back as an
    // unexplained failure on a plugin that was never going to be installed
    test.each(REFUSED_VALUES)('a version of %p is never posted', async (version) => {
      fetch.mockResolvedValue({});

      await run(installMarketplacePlugin, installMarketplacePluginAction('slack', version));

      expect(fetch).not.toHaveBeenCalled();
    });

    test('a version the endpoint would refuse is reported instead of sent', async () => {
      fetch.mockResolvedValue({});

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '   '),
      );

      expect(notifications(dispatched)).toEqual([
        { messageId: 'marketplaceInstallVersionUnknown', type: NOTIFICATION_TYPES.ERROR },
      ]);
      // nothing else happened: the row never entered the installing state it could not leave
      expect(dispatched).toHaveLength(1);
    });

    test('refetches the catalogue on success', async () => {
      fetch.mockResolvedValue({});

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '1.2.0'),
      );

      // showNotification stamps a uid off the clock, so the action cannot be compared whole:
      // two calls a millisecond apart are unequal. The order and the rest of the payload are
      // what this test is about.
      expect(dispatched.map((action) => action.type)).toEqual([
        'installMarketplacePluginStart',
        'installMarketplacePluginSuccess',
        'showNotification',
        'fetchMarketplaceCatalogue',
      ]);
      expect(dispatched[0]).toEqual(installMarketplacePluginStartAction('slack'));
      expect(dispatched[1]).toEqual(installMarketplacePluginSuccessAction('slack'));
      expect(dispatched[3]).toEqual(fetchMarketplaceCatalogueAction({ q: null, category: null }));
    });

    test('says so, naming the version that is now active', async () => {
      // The row leaves Available and reappears under Installed; without a word the page just
      // reshuffles, and whether it worked is the one thing that reshuffle does not say. The
      // version is in the message because install, update and rollback are the same request.
      fetch.mockResolvedValue({});

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '1.2.0'),
      );

      const notification = dispatched.find((action) => action.type === 'showNotification');

      expect(notification).toBeDefined();
      expect(notification.payload).toMatchObject({
        type: NOTIFICATION_TYPES.SUCCESS,
        messageId: 'marketplacePluginInstalled',
        values: { version: '1.2.0' },
      });
    });

    test('a failed install is not announced as a success', async () => {
      fetch.mockRejectedValue(new Error('Bad Gateway'));

      const dispatched = await run(
        installMarketplacePlugin,
        installMarketplacePluginAction('slack', '1.2.0'),
      );

      expect(
        dispatched.some((action) => action?.payload?.messageId === 'marketplacePluginInstalled'),
      ).toBe(false);
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

  describe('fetchMarketplacePluginDetail', () => {
    const detailPayload = pluginDetail;

    test('asks the registry id endpoint, not the catalogue one', async () => {
      fetch.mockResolvedValue(detailPayload);

      await run(
        fetchMarketplacePluginDetail,
        fetchMarketplacePluginDetailAction('plugin-bts-jira'),
      );

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/plugin-bts-jira');
    });

    test('announces the request before it leaves and hands the payload to the store', async () => {
      fetch.mockResolvedValue(detailPayload);

      const dispatched = await run(
        fetchMarketplacePluginDetail,
        fetchMarketplacePluginDetailAction('plugin-bts-jira'),
      );

      expect(dispatched).toEqual([
        fetchMarketplacePluginDetailStartAction('plugin-bts-jira'),
        fetchMarketplacePluginDetailSuccessAction(detailPayload),
      ]);
    });

    test('a failed detail request is reported, like every other failed request here', async () => {
      fetch.mockRejectedValue(new Error('Bad Gateway'));

      const dispatched = await run(
        fetchMarketplacePluginDetail,
        fetchMarketplacePluginDetailAction('plugin-bts-jira'),
      );

      expect(dispatched).toContainEqual(fetchMarketplacePluginDetailErrorAction('Bad Gateway'));
      expect(dispatched).toContainEqual(showDefaultErrorNotification(new Error('Bad Gateway')));
    });

    // opening a second plugin while the first is still in flight must not paint the first
    test('a slow response cannot land on top of a newer one', async () => {
      const slow = deferred();
      const fast = deferred();
      fetch.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);

      const { dispatched, dispatch } = runWatcher(watchFetchMarketplacePluginDetail);
      dispatch(fetchMarketplacePluginDetailAction('plugin-bts-jira'));
      dispatch(fetchMarketplacePluginDetailAction('plugin-notify-slack'));

      fast.resolve({ ...detailPayload, plugin: { id: 'plugin-notify-slack' } });
      await settle();
      slow.resolve(detailPayload);
      await settle();

      const landed = dispatched.filter(
        (action) => action.type === FETCH_MARKETPLACE_PLUGIN_DETAIL_SUCCESS,
      );
      expect(landed).toHaveLength(1);
      expect(landed[0].payload.plugin.id).toBe('plugin-notify-slack');
    });
  });

  describe('marketplace licence', () => {
    test('stores only what the endpoint answers', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      const dispatched = await run(fetchMarketplaceLicence, fetchMarketplaceLicenceAction());

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/licence');
      expect(dispatched).toContainEqual(
        fetchMarketplaceLicenceSuccessAction({ configured: true, customerId: 'acme' }),
      );
    });

    const licenceConstraints = requestConstraints['licence-request.json'].fields;

    test('submits the credentials with PUT', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: 'acme', privateKey: 'c2VjcmV0' }),
      );

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/licence', {
        method: 'put',
        data: { ...licenceRequest, customerId: 'acme', privateKey: 'c2VjcmV0' },
      });
    });

    test('puts exactly the field names the endpoint accepts', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: 'acme', privateKey: 'c2VjcmV0' }),
      );

      expect(Object.keys(sentBody())).toEqual(Object.keys(licenceRequest));
    });

    test('the published constraints are that both halves are required and bounded', () => {
      expect(licenceConstraints).toEqual({
        customerId: {
          mandatory: true,
          refusesEmpty: true,
          refusesBlank: true,
          maxLength: MARKETPLACE_LICENCE_MAX_LENGTHS.customerId,
          refusesLonger: true,
        },
        privateKey: {
          mandatory: true,
          refusesEmpty: true,
          refusesBlank: true,
          maxLength: MARKETPLACE_LICENCE_MAX_LENGTHS.privateKey,
          refusesLonger: true,
        },
      });
    });

    // both halves are @NotBlank there, so a half-filled body is a 400 raised before the handler
    // runs — nothing is stored, and the operator learns only that something failed
    test.each(REFUSED_VALUES)('a customer id of %p is never sent', async (customerId) => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId, privateKey: 'k' }),
      );

      expect(fetch).not.toHaveBeenCalled();
    });

    test.each(REFUSED_VALUES)('a licence key of %p is never sent', async (privateKey) => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: 'acme', privateKey }),
      );

      expect(fetch).not.toHaveBeenCalled();
    });

    test('a value longer than the endpoint accepts is never sent', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({
          customerId: 'a'.repeat(MARKETPLACE_LICENCE_MAX_LENGTHS.customerId + 1),
          privateKey: 'c2VjcmV0',
        }),
      );

      expect(fetch).not.toHaveBeenCalled();
    });

    test('a value exactly as long as the endpoint accepts is sent', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });
      const customerId = 'a'.repeat(MARKETPLACE_LICENCE_MAX_LENGTHS.customerId);

      await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId, privateKey: 'c2VjcmV0' }),
      );

      expect(sentBody()).toEqual({ ...licenceRequest, customerId, privateKey: 'c2VjcmV0' });
    });

    test('credentials the endpoint would refuse are reported instead of sent', async () => {
      const dispatched = await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: '   ', privateKey: 'c2VjcmV0' }),
      );

      expect(notifications(dispatched)).toEqual([
        { messageId: 'marketplaceLicenceRefused', type: NOTIFICATION_TYPES.ERROR },
      ]);
      // and the form is never left waiting on a request that was not made
      expect(dispatched).toHaveLength(1);
    });

    test('never puts the key into anything the store keeps', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      const dispatched = await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: 'acme', privateKey: 'c2VjcmV0' }),
      );

      expect(JSON.stringify(dispatched)).not.toContain('c2VjcmV0');
    });

    test('a rejected submit is reported and leaves the stored state alone', async () => {
      fetch.mockRejectedValue(new Error('Forbidden'));

      const dispatched = await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: 'acme', privateKey: 'c2VjcmV0' }),
      );

      expect(dispatched).toContainEqual(marketplaceLicenceErrorAction('Forbidden'));
      expect(dispatched).toContainEqual(showDefaultErrorNotification(new Error('Forbidden')));
      expect(dispatched).not.toContainEqual(
        fetchMarketplaceLicenceSuccessAction({ configured: true, customerId: 'acme' }),
      );
    });

    test('removing the credentials DELETEs and stores the answer', async () => {
      fetch.mockResolvedValue({ configured: false, customerId: null });

      const dispatched = await run(deleteMarketplaceLicence, deleteMarketplaceLicenceAction());

      expect(fetch).toHaveBeenCalledWith('../api/v1/plugins/licence', { method: 'delete' });
      expect(dispatched).toContainEqual(
        fetchMarketplaceLicenceSuccessAction({ configured: false, customerId: null }),
      );
    });

    test('a submit announces itself so the form can be held while it is in flight', async () => {
      fetch.mockResolvedValue({ configured: true, customerId: 'acme' });

      const dispatched = await run(
        setMarketplaceLicence,
        setMarketplaceLicenceAction({ customerId: 'acme', privateKey: 'c2VjcmV0' }),
      );

      expect(dispatched[0]).toEqual(marketplaceLicenceStartAction());
    });
  });
});
