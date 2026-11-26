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

import { put, race, select, take } from 'redux-saga/effects';
import { createFetchPredicate } from 'controllers/fetch';
import { FETCH_SUCCESS } from 'controllers/fetch/constants';
import { redirect } from 'redux-first-router';
import { ORGANIZATIONS_PAGE, urlOrganizationSlugSelector } from 'controllers/pages';
import { showDefaultErrorNotification } from 'controllers/notification';
import { stringEqual } from 'common/utils/stringUtils';
import { FETCH_ORGANIZATION_BY_SLUG } from './constants';
import { activeOrganizationSelector } from './selectors';

// isNavigationSuperseded tells whether the user has moved on while the organization was loading.
// By default it compares with the organization in the URL; a caller that holds the route action
// until the organization is ready (project pages) has an outdated URL and passes its own check.
export function* withActiveOrganization(
  organizationSlug,
  onActiveOrgReady,
  isNavigationSuperseded,
) {
  const fallbackRedirect = redirect({ type: ORGANIZATIONS_PAGE });
  const isUrlOrganizationChanged = function* isUrlOrganizationChanged() {
    return !stringEqual(organizationSlug, yield select(urlOrganizationSlugSelector));
  };
  let activeOrganization = yield select(activeOrganizationSelector);
  try {
    if (!activeOrganization || !stringEqual(organizationSlug, activeOrganization?.slug)) {
      // A request for another organization aborts this one (fetchData keeps the latest request only).
      const { result } = yield race({
        result: take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG)),
        newerRequest: take(
          (action) =>
            action.type === FETCH_ORGANIZATION_BY_SLUG &&
            !stringEqual(organizationSlug, action.payload?.slug),
        ),
      });
      if (!result) {
        return;
      }
      const resultSlug = result.type === FETCH_SUCCESS ? result.payload?.items?.[0]?.slug : null;
      // Another organization was loaded (or the user has left for another organization or page)
      // after this one was requested: this navigation is superseded, the newer one handles errors.
      const isSuperseded = resultSlug
        ? !stringEqual(organizationSlug, resultSlug)
        : yield* (isNavigationSuperseded || isUrlOrganizationChanged)();
      if (isSuperseded) {
        return;
      }
      activeOrganization = yield select(activeOrganizationSelector);
    }
    if (!activeOrganization || !stringEqual(organizationSlug, activeOrganization?.slug)) {
      yield put(fallbackRedirect);
      return;
    }
    yield* onActiveOrgReady(activeOrganization.id);
  } catch (error) {
    yield put(fallbackRedirect);
    yield put(showDefaultErrorNotification(error));
  }
}
