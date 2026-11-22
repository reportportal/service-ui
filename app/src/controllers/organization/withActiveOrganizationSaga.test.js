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
import { redirect } from 'redux-first-router';
import { fetchErrorAction, fetchSuccessAction } from 'controllers/fetch';
import { ORGANIZATIONS_PAGE } from 'controllers/pages';
import { FETCH_ORGANIZATION_BY_SLUG } from './constants';
import { withActiveOrganization } from './withActiveOrganizationSaga';

const createStore = (activeOrganization, urlOrganizationSlug) => {
  const listeners = [];
  const dispatched = [];
  const state = {
    organizations: { organization: { activeOrganization } },
    location: { payload: { organizationSlug: urlOrganizationSlug } },
  };
  return {
    dispatched,
    getState: () => state,
    subscribe: (listener) => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    },
    dispatch: (action) => {
      if (action.meta?.namespace === FETCH_ORGANIZATION_BY_SLUG) {
        state.organizations.organization.activeOrganization = action.payload?.items?.[0] || null;
      } else {
        dispatched.push(action);
      }
      listeners.slice().forEach((listener) => listener(action));
      return action;
    },
  };
};

const startWaiting = (store, slug) => {
  const readyIds = [];
  const task = runSaga(store, withActiveOrganization, slug, function* onActiveOrgReady(id) {
    yield readyIds.push(id);
  });
  return { task, readyIds };
};

describe('withActiveOrganization', () => {
  test('continues once the result for its own organization arrives', () => {
    const store = createStore({ id: 1, slug: 'a' });
    const { task, readyIds } = startWaiting(store, 'b');

    store.dispatch(
      fetchSuccessAction(FETCH_ORGANIZATION_BY_SLUG, { items: [{ id: 2, slug: 'b' }] }),
    );

    expect(readyIds).toEqual([2]);
    expect(store.dispatched).toEqual([]);
    expect(task.isRunning()).toBe(false);
  });

  test('stops silently when another organization is loaded instead', () => {
    const store = createStore({ id: 1, slug: 'a' });
    const { task, readyIds } = startWaiting(store, 'b');

    store.dispatch(
      fetchSuccessAction(FETCH_ORGANIZATION_BY_SLUG, { items: [{ id: 3, slug: 'c' }] }),
    );

    expect(readyIds).toEqual([]);
    expect(store.dispatched).toEqual([]);
    expect(task.isRunning()).toBe(false);
  });

  test('redirects to the organizations list when its organization is not found', () => {
    const store = createStore({ id: 1, slug: 'a' }, 'b');
    const { readyIds } = startWaiting(store, 'b');

    store.dispatch(fetchSuccessAction(FETCH_ORGANIZATION_BY_SLUG, { items: [] }));

    expect(readyIds).toEqual([]);
    expect(store.dispatched).toEqual([redirect({ type: ORGANIZATIONS_PAGE })]);
  });

  test('redirects to the organizations list when loading fails', () => {
    const store = createStore({ id: 1, slug: 'a' }, 'b');
    const { readyIds } = startWaiting(store, 'b');

    store.dispatch(fetchErrorAction(FETCH_ORGANIZATION_BY_SLUG, { message: 'boom' }));

    expect(readyIds).toEqual([]);
    expect(store.dispatched).toEqual([redirect({ type: ORGANIZATIONS_PAGE })]);
  });

  test('stops silently when loading fails after the user has moved to another organization', () => {
    const store = createStore({ id: 1, slug: 'a' }, 'c');
    const { task, readyIds } = startWaiting(store, 'b');

    store.dispatch(fetchErrorAction(FETCH_ORGANIZATION_BY_SLUG, { message: 'boom' }));

    expect(readyIds).toEqual([]);
    expect(store.dispatched).toEqual([]);
    expect(task.isRunning()).toBe(false);
  });
});
