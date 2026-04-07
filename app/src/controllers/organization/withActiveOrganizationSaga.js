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

import { put, select, take } from 'redux-saga/effects';
import { createFetchPredicate } from 'controllers/fetch';
import { redirect } from 'redux-first-router';
import { ORGANIZATIONS_PAGE } from 'controllers/pages';
import { showDefaultErrorNotification } from 'controllers/notification';
import { stringEqual } from 'common/utils/stringUtils';
import { FETCH_ORGANIZATION_BY_SLUG } from './constants';
import { activeOrganizationSelector } from './selectors';

export function* withActiveOrganization(organizationSlug, onActiveOrgReady) {
  const fallbackRedirect = redirect({ type: ORGANIZATIONS_PAGE });
  let activeOrganization = yield select(activeOrganizationSelector);
  try {
    if (!activeOrganization || !stringEqual(organizationSlug, activeOrganization?.slug)) {
      yield take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG));
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
