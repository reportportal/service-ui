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

import { getStorageItem } from 'common/utils/storageUtils';
import { NOT_FOUND } from 'redux-first-router';
import {
  OAUTH_SUCCESS,
  LOGIN_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  HOME_PAGE,
  PROJECT_DASHBOARD_PAGE,
} from 'controllers/pages/constants';
import { onBeforeRouteChange } from './routesMap';

jest.mock('./constants', () => {
  const { NOT_FOUND } = jest.requireActual('redux-first-router');
  const {
    OAUTH_SUCCESS,
    LOGIN_PAGE,
    PROJECT_DASHBOARD_PRINT_PAGE,
    HOME_PAGE,
    PROJECT_DASHBOARD_PAGE,
  } = jest.requireActual('controllers/pages/constants');

  return {
    ANONYMOUS_ACCESS: 'anonymous',
    ADMIN_ACCESS: 'admin',
    pageRendering: {
      [NOT_FOUND]: {},
      [OAUTH_SUCCESS]: { access: 'anonymous' },
      [LOGIN_PAGE]: { access: 'anonymous' },
      [PROJECT_DASHBOARD_PRINT_PAGE]: {},
      [HOME_PAGE]: {},
      [PROJECT_DASHBOARD_PAGE]: {},
    },
  };
});

const state = (authorized) => ({
  location: { type: PROJECT_DASHBOARD_PAGE },
  auth: { authorized },
  user: { info: { userId: 5 } },
});

const run = ({ type, authorized = true }) => {
  const dispatch = jest.fn();
  const s = state(authorized);
  onBeforeRouteChange(dispatch, () => s, {
    action: { type, payload: { organizationSlug: 'org', projectSlug: 'proj', dashboardId: '1' } },
  });
  return dispatch;
};

const isRedirect = ([action]) => action?.meta?.location?.kind === 'redirect';

describe('onBeforeRouteChange', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it.each([NOT_FOUND, PROJECT_DASHBOARD_PRINT_PAGE])('does not store %s as lastPath', (type) => {
    run({ type });

    expect(getStorageItem('5_settings')?.lastPath).toBeUndefined();
  });

  it('does not store redirect-only routes as lastPath', () => {
    run({ type: HOME_PAGE });

    expect(getStorageItem('5_settings')?.lastPath).toBeUndefined();
  });

  it('stores regular pages as lastPath', () => {
    run({ type: PROJECT_DASHBOARD_PAGE });

    expect(getStorageItem('5_settings')?.lastPath).toBeDefined();
  });

  it('lets OAUTH_SUCCESS through for an authorized user and never stores its URL', () => {
    const dispatch = run({ type: OAUTH_SUCCESS });

    expect(dispatch.mock.calls.filter(isRedirect)).toHaveLength(0);
    expect(sessionStorage.length).toBe(0);
    expect(getStorageItem('5_settings')).toBeNull();
  });

  it('still redirects an authorized user away from the login page', () => {
    const dispatch = run({ type: LOGIN_PAGE });

    expect(dispatch.mock.calls.filter(isRedirect)).toHaveLength(1);
  });
});
