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
import { urlProjectSlugSelector, urlOrganizationSlugSelector, APP_LEVEL } from 'controllers/pages';
import {
  activeOrganizationSelector,
  activeOrganizationLoadingSelector,
} from 'controllers/organization';
import { FETCH_ORGANIZATION_BY_SLUG } from 'controllers/organization/constants';
import { baseEventParametersSelector } from 'controllers/appInfo';
import { createFetchPredicate } from 'controllers/fetch';
import {
  normalizeDimensionValue,
  getAutoAnalysisEventValue,
} from 'components/main/analytics/utils';
import { omit } from 'common/utils';
import GA4 from 'react-ga4';
import { INFO_READY_DELAY, SEND_ANALYTICS_EVENT } from './constants';

export function* waitForProjectReady() {
  const routeProjectSlug = yield select(urlProjectSlugSelector);

  const getData = (project = {}) => ({ projectId: project?.projectId || null });

  if (!routeProjectSlug) {
    return getData();
  }

  let projectInfo = yield select(projectInfoSelector);
  const isLoading = yield select(projectInfoLoadingSelector);

  if (projectInfo?.projectSlug === routeProjectSlug) {
    return getData(projectInfo);
  }

  if (!isLoading) {
    return getData();
  }

  const { success } = yield race({
    success: take(FETCH_PROJECT_SUCCESS),
    error: take(FETCH_PROJECT_ERROR),
    timeout: delay(INFO_READY_DELAY),
  });

  if (success) {
    projectInfo = yield select(projectInfoSelector);
    if (projectInfo?.projectSlug === routeProjectSlug) {
      return getData(projectInfo);
    }
  }

  return getData();
}

export function* waitForOrganizationReady() {
  const routeOrganizationSlug = yield select(urlOrganizationSlugSelector);

  const getData = (org = {}) => ({
    organizationId: org?.id || null,
    entryType: org?.type?.toLowerCase() || null,
  });

  if (!routeOrganizationSlug) {
    return getData();
  }

  let activeOrganization = yield select(activeOrganizationSelector);
  const isLoading = yield select(activeOrganizationLoadingSelector);

  if (activeOrganization?.slug === routeOrganizationSlug) {
    return getData(activeOrganization);
  }

  if (!isLoading) {
    return getData();
  }

  const { success } = yield race({
    success: take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG)),
    timeout: delay(INFO_READY_DELAY),
  });

  if (success) {
    activeOrganization = yield select(activeOrganizationSelector);
    if (activeOrganization?.slug === routeOrganizationSlug) {
      return getData(activeOrganization);
    }
  }

  return getData();
}

function* sendAnalyticsEvent({ payload: data }) {
  const { projectId } = yield call(waitForProjectReady);
  const { organizationId, entryType } = yield call(waitForOrganizationReady);
  const baseEventParameters = yield select(baseEventParametersSelector);
  const {
    instanceId,
    buildVersion,
    userId,
    isAutoAnalyzerEnabled,
    isPatternAnalyzerEnabled,
    isAnalyzerAvailable,
    pageLevel,
  } = baseEventParameters;

  if ('place' in data) {
    const isProjectLevel = pageLevel === APP_LEVEL.PROJECT;
    const isOrganizationLevel = pageLevel === APP_LEVEL.ORGANIZATION;

    const eventParameters = {
      instanceID: instanceId,
      version: buildVersion,
      timestamp: Date.now(),
      uid: `${userId}|${instanceId}`,
      ...((isOrganizationLevel || isProjectLevel) && {
        kind: entryType || 'not_set',
        organization_id: organizationId ? `${organizationId}|${instanceId}` : 'not_set',
      }),
      ...(isProjectLevel && {
        auto_analysis:
          getAutoAnalysisEventValue(isAnalyzerAvailable, isAutoAnalyzerEnabled) || 'not_set',
        pattern_analysis: normalizeDimensionValue(isPatternAnalyzerEnabled) || 'not_set',
        project_id: projectId ? `${projectId}|${instanceId}` : 'not_set',
      }),
      ...omit(data, data.place ? ['action'] : ['action', 'place']),
    };
    GA4.event(data.action, eventParameters);
  }
}

function* watchSendAnalyticsEvent() {
  yield takeEvery(SEND_ANALYTICS_EVENT, sendAnalyticsEvent);
}

export function* analyticsSagas() {
  yield watchSendAnalyticsEvent();
}
