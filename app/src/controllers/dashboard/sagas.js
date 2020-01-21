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
import { activeProjectSelector, apiTokenStringSelector, userIdSelector } from 'controllers/user';
import { hideModalAction } from 'controllers/modal';
import { fetch, updateToken } from 'common/utils/fetch';
import { setStorageItem } from 'common/utils/storageUtils';
import { tokenSelector } from 'controllers/auth';
import {
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PAGE,
  activeDashboardIdSelector,
  pageSelector,
  projectIdSelector,
} from 'controllers/pages';
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
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.dashboards(activeProject), {
      params: {
        ...query,
        ...params,
      },
    }),
  );
}

function* fetchDashboard() {
  const activeProject = yield select(activeProjectSelector);
  const activeDashboardId = yield select(activeDashboardIdSelector);
  const dashboardItems = yield select(dashboardItemsSelector);

  if (dashboardItems.length === 0) {
    yield call(fetchDashboards, { payload: {} });
    yield take(createFetchPredicate(NAMESPACE));
  }

  try {
    const dashboard = yield call(fetch, URLS.dashboard(activeProject, activeDashboardId));
    yield put(updateDashboardItemSuccessAction(dashboard));
  } catch (error) {
    const projectId = yield select(projectIdSelector);
    yield put(
      redirect({
        type: PROJECT_DASHBOARD_PAGE,
        payload: { projectId },
      }),
    );
  }
}

function* addDashboard({ payload: dashboard }) {
  const activeProject = yield select(activeProjectSelector);
  const owner = yield select(userIdSelector);
  const { id } = yield call(fetch, URLS.dashboards(activeProject), {
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
    payload: { projectId: activeProject, dashboardId: id },
  });
}

function* updateDashboard({ payload: dashboard }) {
  const activeProject = yield select(activeProjectSelector);
  const { name, description, share, id } = dashboard;

  yield call(fetch, URLS.dashboard(activeProject, id), {
    method: 'put',
    data: { name, description, share },
  });
  yield put(updateDashboardItemSuccessAction(dashboard));
}

function* updateDashboardWidgets({ payload: dashboard }) {
  const activeProject = yield select(activeProjectSelector);

  yield call(fetch, URLS.dashboard(activeProject, dashboard.id), {
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
    const activeProject = yield select(activeProjectSelector);
    yield call(fetch, URLS.dashboard(activeProject, id), {
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
  if (activePage === PROJECT_DASHBOARD_ITEM_PAGE) {
    const activeDashboardId = yield select(activeDashboardIdSelector);
    if (activeDashboardId === dashboardId) {
      const activeProject = yield select(projectIdSelector);
      yield put(hideModalAction());
      yield put(
        redirect({
          type: PROJECT_DASHBOARD_PAGE,
          payload: { projectId: activeProject },
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
