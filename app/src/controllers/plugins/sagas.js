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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { projectIdSelector } from 'controllers/pages';
import { fetchDataAction, createFetchPredicate } from 'controllers/fetch';
import { hideModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { fetch, omit } from 'common/utils';
import {
  NAMESPACE,
  FETCH_PLUGINS,
  REMOVE_PLUGIN,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  ADD_INTEGRATION,
  UPDATE_INTEGRATION,
  REMOVE_INTEGRATION,
  FETCH_GLOBAL_INTEGRATIONS,
  SECRET_FIELDS_KEY,
  FETCH_GLOBAL_INTEGRATIONS_SUCCESS,
} from './constants';
import { resolveIntegrationUrl } from './utils';
import { pluginByNameSelector } from './selectors';
import {
  removePluginSuccessAction,
  addProjectIntegrationSuccessAction,
  updateProjectIntegrationSuccessAction,
  removeProjectIntegrationSuccessAction,
  removeProjectIntegrationsByTypeSuccessAction,
  addGlobalIntegrationSuccessAction,
  removeGlobalIntegrationSuccessAction,
  updateGlobalIntegrationSuccessAction,
  fetchGlobalIntegrationsSuccessAction,
} from './actionCreators';
import { fetchUiExtensions } from './uiExtensions';

function* addIntegration({ payload: { data, isGlobal, pluginName, callback }, meta }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const integrationUrl = isGlobal
      ? URLS.newGlobalIntegration(pluginName)
      : URLS.newProjectIntegration(projectId, pluginName);
    const url = resolveIntegrationUrl(integrationUrl, pluginName);
    const response = yield call(fetch, url, {
      method: 'post',
      data,
    });

    const integrationType = yield select(pluginByNameSelector, pluginName);
    const newIntegration = {
      ...data,
      integrationParameters: omit(data.integrationParameters, meta[SECRET_FIELDS_KEY]),
      id: response.id,
      integrationType,
    };
    const addIntegrationSuccessAction = isGlobal
      ? addGlobalIntegrationSuccessAction(newIntegration)
      : addProjectIntegrationSuccessAction(newIntegration);
    yield put(addIntegrationSuccessAction);
    yield put(
      showNotification({
        messageId: 'addIntegrationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
    yield call(callback, newIntegration);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchAddIntegration() {
  yield takeEvery(ADD_INTEGRATION, addIntegration);
}

function* updateIntegration({ payload: { data, isGlobal, pluginName, id, callback }, meta }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const integrationUrl = isGlobal
      ? URLS.globalIntegration(id)
      : URLS.projectIntegration(projectId, id);
    const url = resolveIntegrationUrl(integrationUrl, pluginName);

    yield call(fetch, url, {
      method: 'put',
      data,
    });

    const integration = {
      ...data,
      integrationParameters: omit(data.integrationParameters, meta[SECRET_FIELDS_KEY]),
    };
    const updateIntegrationSuccessAction = isGlobal
      ? updateGlobalIntegrationSuccessAction(integration, id)
      : updateProjectIntegrationSuccessAction(integration, id);
    yield put(updateIntegrationSuccessAction);
    yield put(
      showNotification({
        messageId: 'updateIntegrationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield call(callback);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateIntegration() {
  yield takeEvery(UPDATE_INTEGRATION, updateIntegration);
}

function* removeIntegration({ payload: { id, isGlobal, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const url = isGlobal ? URLS.globalIntegration(id) : URLS.projectIntegration(projectId, id);

    yield call(fetch, url, {
      method: 'delete',
    });

    const removeIntegrationSuccessAction = isGlobal
      ? removeGlobalIntegrationSuccessAction(id)
      : removeProjectIntegrationSuccessAction(id);
    yield put(removeIntegrationSuccessAction);
    yield put(
      showNotification({
        messageId: 'removeIntegrationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield call(callback);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveIntegration() {
  yield takeEvery(REMOVE_INTEGRATION, removeIntegration);
}

function* removeIntegrationsByType({ payload: instanceType }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.removeProjectIntegrationByType(projectId, instanceType), {
      method: 'delete',
    });
    yield put(removeProjectIntegrationsByTypeSuccessAction(instanceType));
    yield put(
      showNotification({
        messageId: 'resetToGlobalSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveIntegrationsByType() {
  yield takeEvery(REMOVE_PROJECT_INTEGRATIONS_BY_TYPE, removeIntegrationsByType);
}

function* fetchGlobalIntegrations() {
  try {
    const globalIntegrations = yield call(fetch, URLS.globalIntegrationsByPluginName());
    yield put(fetchGlobalIntegrationsSuccessAction(globalIntegrations));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchFetchGlobalIntegrations() {
  yield takeEvery(FETCH_GLOBAL_INTEGRATIONS, fetchGlobalIntegrations);
}

function* fetchPlugins() {
  yield put(fetchDataAction(NAMESPACE)(URLS.plugin()));
}

function* watchFetchPlugins() {
  yield takeEvery(FETCH_PLUGINS, fetchPlugins);
}

function* removePlugin({ payload: { id, callback } }) {
  yield put(showScreenLockAction());
  try {
    yield call(fetch, URLS.pluginUpdate(id), {
      method: 'delete',
    });
    yield put(removePluginSuccessAction(id));
    yield put(
      showNotification({
        messageId: 'removePluginSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield call(callback);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemovePlugin() {
  yield takeEvery(REMOVE_PLUGIN, removePlugin);
}

function* watchPluginChange() {
  yield takeEvery(
    [createFetchPredicate(NAMESPACE), FETCH_GLOBAL_INTEGRATIONS_SUCCESS],
    fetchUiExtensions,
  );
}

export function* pluginSagas() {
  yield all([
    watchAddIntegration(),
    watchUpdateIntegration(),
    watchRemoveIntegration(),
    watchRemoveIntegrationsByType(),
    watchFetchGlobalIntegrations(),
    watchFetchPlugins(),
    watchRemovePlugin(),
    watchPluginChange(),
  ]);
}
