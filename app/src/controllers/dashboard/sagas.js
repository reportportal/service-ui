/*
 * Copyright 2019 EPAM Systems
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

import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { showNotification, showDefaultErrorNotification } from 'controllers/notification';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import { redirect } from 'redux-first-router';
import { URLS } from 'common/urls';
import { fetchDataAction } from 'controllers/fetch';
import { userIdSelector, activeProjectKeySelector } from 'controllers/user';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { fetch } from 'common/utils/fetch';
import { setStorageItem } from 'common/utils/storageUtils';
import {
  urlOrganizationAndProjectSelector,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PAGE,
  activeDashboardIdSelector,
  pageSelector,
  pagePropertiesSelector,
} from 'controllers/pages';

import { provideEcGA } from 'components/main/analytics/utils';
import { formatEcDashboardData } from 'components/main/analytics/events/common/widgetPages/utils';
import { analyticsEnabledSelector, baseEventParametersSelector } from 'controllers/appInfo';
import {
  ADD_DASHBOARD,
  CHANGE_VISIBILITY_TYPE,
  DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY,
  FETCH_DASHBOARD,
  FETCH_DASHBOARDS,
  NAMESPACE,
  REMOVE_DASHBOARD,
  UPDATE_DASHBOARD,
  UPDATE_DASHBOARD_WIDGETS,
  REMOVE_DASHBOARD_SUCCESS,
  INCREASE_TOTAL_DASHBOARDS_LOCALLY,
  DECREASE_TOTAL_DASHBOARDS_LOCALLY,
  DUPLICATE_DASHBOARD,
  COPY_DASHBOARD_CONFIG,
} from './constants';
import { querySelector } from './selectors';
import {
  addDashboardSuccessAction,
  deleteDashboardSuccessAction,
  updateDashboardItemSuccessAction,
} from './actionCreators';
import { getDashboardNotificationAction, tryParseConfig } from './utils';

function* fetchDashboards({ payload: params }) {
  const projectKey = yield select(activeProjectKeySelector);
  const query = yield select(querySelector);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.dashboards(projectKey), {
      params: {
        ...query,
        ...params,
      },
    }),
  );
}

function* fetchDashboard() {
  const projectKey = yield select(projectKeySelector);
  const { organizationSlug, projectSlug } = yield select(urlOrganizationAndProjectSelector);
  const activeDashboardId = yield select(activeDashboardIdSelector);
  const isAnalyticsEnabled = yield select(analyticsEnabledSelector);
  let dashboard;
  try {
    dashboard = yield call(fetch, URLS.dashboard(projectKey, activeDashboardId));
    yield put(updateDashboardItemSuccessAction(dashboard));
  } catch (error) {
    yield put(
      redirect({
        type: PROJECT_DASHBOARD_PAGE,
        payload: { organizationSlug, projectSlug },
      }),
    );
  }

  if (isAnalyticsEnabled && dashboard?.widgets.length) {
    const baseEventParameters = yield select(baseEventParametersSelector);

    provideEcGA({
      eventName: 'view_item_list',
      baseEventParameters,
      additionalParameters: {
        item_list_name: dashboard.id,
        items: formatEcDashboardData(dashboard),
      },
    });
  }
}

function* addDashboard({ payload: dashboard }) {
  const projectKey = yield select(projectKeySelector);
  const { organizationSlug, projectSlug } = yield select(urlOrganizationAndProjectSelector);
  const owner = yield select(userIdSelector);
  const { name, onSuccess, onError } = dashboard;
  const isPreconfigured = typeof dashboard.config !== 'undefined';

  try {
    let parsedConfig = null;
    let url = URLS.dashboards(projectKey);
    let data = dashboard;

    if (isPreconfigured) {
      parsedConfig = tryParseConfig(dashboard.config);

      if (!parsedConfig) {
        if (onError) {
          onError();
        }
        yield put(
          showNotification({
            messageId: 'addPreconfigDashboardError',
            type: NOTIFICATION_TYPES.ERROR,
          }),
        );

        return;
      }

      url = URLS.dashboardPreconfigured(projectKey);
      data = {
        name: dashboard.name,
        description: dashboard.description,
        config: parsedConfig,
      };
    }

    const response = yield call(fetch, url, {
      method: 'post',
      data,
    });

    if (onSuccess) {
      onSuccess();
    }

    const { id } = response;

    yield put(addDashboardSuccessAction({ id, owner, ...dashboard }));
    yield put({ type: INCREASE_TOTAL_DASHBOARDS_LOCALLY });
    yield put(
      showNotification({
        messageId: 'addDashboardSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );

    yield put(hideModalAction());
    const query = yield select(pagePropertiesSelector);
    yield put({
      type: PROJECT_DASHBOARD_ITEM_PAGE,
      payload: { projectSlug, dashboardId: id, organizationSlug },
      meta: {
        query,
      },
    });
  } catch (error) {
    if (isPreconfigured && onError) {
      onError();
    }

    yield put(getDashboardNotificationAction(error, name));
  }
}

function* duplicateDashboard({ payload: dashboard }) {
  const projectKey = yield select(activeProjectKeySelector);
  try {
    const config = yield call(fetch, URLS.dashboardConfig(projectKey, dashboard.id));
    const result = yield call(fetch, URLS.dashboardPreconfigured(projectKey), {
      method: 'post',
      data: {
        name: dashboard.name,
        description: dashboard.description,
        config,
      },
    });

    const newDashboard = yield call(fetch, URLS.dashboard(projectKey, result.id));
    yield put(addDashboardSuccessAction(newDashboard));

    yield put(
      showNotification({
        messageId: 'duplicateDashboardSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(getDashboardNotificationAction(error, dashboard.name));
  }
}

function* copyDashboardConfig({ payload: dashboard }) {
  const projectKey = yield select(activeProjectKeySelector);
  try {
    const config = yield call(fetch, URLS.dashboardConfig(projectKey, dashboard.id));
    yield call([navigator.clipboard, 'writeText'], JSON.stringify(config));
    yield put(
      showNotification({
        messageId: 'dashboardConfigurationCopied',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* updateDashboard({ payload: dashboard }) {
  const projectKey = yield select(projectKeySelector);
  const { name, description, id } = dashboard;

  try {
    yield call(fetch, URLS.dashboard(projectKey, id), {
      method: 'put',
      data: { name, description },
    });
    yield put(updateDashboardItemSuccessAction(dashboard));
    yield put(
      showNotification({
        messageId: 'updateDashboardSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(getDashboardNotificationAction(error, name));
  }
}

function* updateDashboardWidgets({ payload: dashboard }) {
  const projectKey = yield select(projectKeySelector);

  yield call(fetch, URLS.dashboard(projectKey, dashboard.id), {
    method: 'put',
    data: {
      name: dashboard.name,
      updateWidgets: dashboard.widgets,
    },
  });
  yield put(updateDashboardItemSuccessAction(dashboard));
}

function* removeDashboard({ payload: id }) {
  try {
    const projectKey = yield select(projectKeySelector);
    yield call(fetch, URLS.dashboard(projectKey, id), {
      method: 'delete',
    });
    yield put(deleteDashboardSuccessAction(id));
    yield put({ type: DECREASE_TOTAL_DASHBOARDS_LOCALLY });
    yield put(
      showNotification({
        messageId: 'deleteDashboardSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* redirectAfterDelete({ payload: dashboardId }) {
  const activePage = yield select(pageSelector);
  const { organizationSlug, projectSlug } = yield select(urlOrganizationAndProjectSelector);
  if (activePage === PROJECT_DASHBOARD_ITEM_PAGE) {
    const activeDashboardId = yield select(activeDashboardIdSelector);
    if (activeDashboardId === dashboardId) {
      yield put(hideModalAction());
      yield put(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: { organizationSlug, projectSlug },
        }),
      );
    }
  }
}

function changeVisibilityType({ payload: visibilityType }) {
  setStorageItem(DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY, visibilityType);
}

export function* dashboardSagas() {
  yield all([
    yield takeEvery(FETCH_DASHBOARDS, fetchDashboards),
    yield takeEvery(FETCH_DASHBOARD, fetchDashboard),
    yield takeEvery(ADD_DASHBOARD, addDashboard),
    yield takeEvery(UPDATE_DASHBOARD, updateDashboard),
    yield takeEvery(UPDATE_DASHBOARD_WIDGETS, updateDashboardWidgets),
    yield takeEvery(REMOVE_DASHBOARD, removeDashboard),
    yield takeEvery(CHANGE_VISIBILITY_TYPE, changeVisibilityType),
    yield takeEvery(REMOVE_DASHBOARD_SUCCESS, redirectAfterDelete),
    yield takeEvery(DUPLICATE_DASHBOARD, duplicateDashboard),
    yield takeEvery(COPY_DASHBOARD_CONFIG, copyDashboardConfig),
  ]);
}
