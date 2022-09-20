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

import { all, call, put, select, take, takeEvery } from 'redux-saga/effects';
import { showNotification, showDefaultErrorNotification } from 'controllers/notification';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import { redirect } from 'redux-first-router';
import { URLS } from 'common/urls';
import { fetchDataAction, createFetchPredicate } from 'controllers/fetch';
import { apiTokenStringSelector, userIdSelector, activeProjectKeySelector } from 'controllers/user';
import { hideModalAction } from 'controllers/modal';
import { fetch, updateToken } from 'common/utils/fetch';
import { setStorageItem } from 'common/utils/storageUtils';
import { tokenSelector } from 'controllers/auth';
import {
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PAGE,
  activeDashboardIdSelector,
  pageSelector,
} from 'controllers/pages';
import { provideEcGA } from 'components/main/analytics/utils';
import { formatEcDashboardData } from 'components/main/analytics/events/common/widgetPages/utils';
import { analyticsEnabledSelector } from 'controllers/appInfo';
import { projectKeySelector, projectOrganizationSlugSelector } from 'controllers/project';

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
  CHANGE_FULL_SCREEN_MODE,
  TOGGLE_FULL_SCREEN_MODE,
} from './constants';
import {
  dashboardFullScreenModeSelector,
  dashboardItemsSelector,
  querySelector,
} from './selectors';
import {
  addDashboardSuccessAction,
  deleteDashboardSuccessAction,
  updateDashboardItemSuccessAction,
} from './actionCreators';

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
  const activeDashboardId = yield select(activeDashboardIdSelector);
  const dashboardItems = yield select(dashboardItemsSelector);
  const isAnalyticsEnabled = yield select(analyticsEnabledSelector);
  const projectKey = yield select(activeProjectKeySelector);
  const organizationSlug = yield select(projectOrganizationSlugSelector);
  let dashboard;

  if (dashboardItems.length === 0) {
    yield call(fetchDashboards, { payload: {} });
    yield take(createFetchPredicate(NAMESPACE));
  }

  try {
    dashboard = yield call(fetch, URLS.dashboard(projectKey, activeDashboardId));
    yield put(updateDashboardItemSuccessAction(dashboard));
  } catch (error) {
    yield put(
      redirect({
        type: PROJECT_DASHBOARD_PAGE,
        payload: { projectKey, organizationSlug },
      }),
    );
  }

  if (isAnalyticsEnabled && dashboard && dashboard.widgets.length) {
    provideEcGA({
      name: 'addImpression',
      data: formatEcDashboardData(dashboard),
      action: 'impression',
    });
  }
}

function* addDashboard({ payload: dashboard }) {
  const projectKey = yield select(projectKeySelector);
  const owner = yield select(userIdSelector);
  const organizationSlug = yield select(projectOrganizationSlugSelector);
  const { id } = yield call(fetch, URLS.dashboards(projectKey), {
    method: 'post',
    data: dashboard,
  });

  yield put(addDashboardSuccessAction({ id, owner, ...dashboard }));
  yield put(
    showNotification({
      messageId: 'addDashboardSuccess',
      type: NOTIFICATION_TYPES.SUCCESS,
    }),
  );
  yield put(hideModalAction());
  yield put({
    type: PROJECT_DASHBOARD_ITEM_PAGE,
    payload: {
      projectKey,
      dashboardId: id,
      organizationSlug,
    },
  });
}

function* updateDashboard({ payload: dashboard }) {
  const projectKey = yield select(projectKeySelector);
  const { name, description, id } = dashboard;

  yield call(fetch, URLS.dashboard(projectKey, id), {
    method: 'put',
    data: { name, description },
  });
  yield put(updateDashboardItemSuccessAction(dashboard));
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
  const organizationSlug = yield select(projectOrganizationSlugSelector);
  if (activePage === PROJECT_DASHBOARD_ITEM_PAGE) {
    const activeDashboardId = yield select(activeDashboardIdSelector);
    if (activeDashboardId === dashboardId) {
      const projectKey = yield select(projectKeySelector);
      yield put(hideModalAction());
      yield put(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: { projectKey, organizationSlug },
        }),
      );
    }
  }
}

function changeVisibilityType({ payload: visibilityType }) {
  setStorageItem(DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY, visibilityType);
}

function* updateTokenAccordingToFullscreenMode() {
  const fullScreenMode = yield select(dashboardFullScreenModeSelector);
  const selector = fullScreenMode ? apiTokenStringSelector : tokenSelector;
  const token = yield select(selector);
  yield call(updateToken, token);
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
    yield takeEvery(
      [CHANGE_FULL_SCREEN_MODE, TOGGLE_FULL_SCREEN_MODE],
      updateTokenAccordingToFullscreenMode,
    ),
  ]);
}
