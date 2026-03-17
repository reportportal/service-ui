/*
 * Copyright 2025 EPAM Systems
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

import { takeEvery, select, take, call, race } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_ERROR,
  projectInfoSelector,
  projectInfoLoadingSelector,
} from 'controllers/project';
import { urlProjectSlugSelector, urlOrganizationSlugSelector } from 'controllers/pages';
import {
  activeOrganizationSelector,
  activeOrganizationLoadingSelector,
} from 'controllers/organization';
import { FETCH_ORGANIZATION_BY_SLUG } from 'controllers/organization/constants';
import { baseEventParametersSelector } from 'controllers/appInfo';
import { createFetchPredicate } from 'controllers/fetch';
import { buildEventParameters } from 'components/main/analytics/utils';
import { omit } from 'common/utils';
import GA4 from 'react-ga4';
import { INFO_READY_DELAY, SEND_ANALYTICS_EVENT } from './constants';

function* waitForEntityReady({
  slugSelector,
  entitySelector,
  loadingSelector,
  slugKey,
  raceActions,
  getData,
}) {
  const routeSlug = yield select(slugSelector);

  if (!routeSlug) {
    return getData();
  }

  let entity = yield select(entitySelector);
  const isLoading = yield select(loadingSelector);

  if (entity?.[slugKey] === routeSlug) {
    return getData(entity);
  }

  if (!isLoading) {
    return getData();
  }

  const { success } = yield race({
    ...raceActions,
    timeout: delay(INFO_READY_DELAY),
  });

  if (success) {
    entity = yield select(entitySelector);
    if (entity?.[slugKey] === routeSlug) {
      return getData(entity);
    }
  }

  return getData();
}

export function* waitForProjectReady() {
  return yield* waitForEntityReady({
    slugSelector: urlProjectSlugSelector,
    entitySelector: projectInfoSelector,
    loadingSelector: projectInfoLoadingSelector,
    slugKey: 'projectSlug',
    raceActions: {
      success: take(FETCH_PROJECT_SUCCESS),
      error: take(FETCH_PROJECT_ERROR),
    },
    getData: (project = {}) => ({ projectInfoId: project?.projectId || null }),
  });
}

export function* waitForOrganizationReady() {
  return yield* waitForEntityReady({
    slugSelector: urlOrganizationSlugSelector,
    entitySelector: activeOrganizationSelector,
    loadingSelector: activeOrganizationLoadingSelector,
    slugKey: 'slug',
    raceActions: {
      success: take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG)),
    },
    getData: (org = {}) => ({
      organizationId: org?.id || null,
      entryType: org?.type?.toLowerCase() || null,
    }),
  });
}

function* sendAnalyticsEvent({ payload: data }) {
  const projectData = yield call(waitForProjectReady);
  const organizationData = yield call(waitForOrganizationReady);
  const baseEventParameters = yield select(baseEventParametersSelector);

  if ('place' in data) {
    const eventParameters = buildEventParameters(
      { ...baseEventParameters, ...projectData, ...organizationData },
      omit(data, data.place ? ['action'] : ['action', 'place']),
    );
    GA4.event(data.action, eventParameters);
  }
}

function* watchSendAnalyticsEvent() {
  yield takeEvery(SEND_ANALYTICS_EVENT, sendAnalyticsEvent);
}

export function* analyticsSagas() {
  yield watchSendAnalyticsEvent();
}
