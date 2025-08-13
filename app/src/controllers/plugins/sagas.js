/*
 * Copyright 2024 EPAM Systems
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
import { fetchDataAction, createFetchPredicate } from 'controllers/fetch';
import { hideModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { fetch, omit } from 'common/utils';
import { userIdSelector } from 'controllers/user';
import { projectKeySelector } from 'controllers/project/selectors';
import {
  NAMESPACE,
  FETCH_PLUGINS,
  FETCH_PUBLIC_PLUGINS,
  REMOVE_PLUGIN,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  ADD_INTEGRATION,
  UPDATE_INTEGRATION,
  REMOVE_INTEGRATION,
  FETCH_GLOBAL_INTEGRATIONS,
  SECRET_FIELDS_KEY,
  UPDATE_PLUGIN_SUCCESS,
  PUBLIC_PLUGINS,
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
  removeGlobalIntegrationsByTypeSuccessAction,
} from './actionCreators';
import { fetchExtensionManifests, fetchExtensionManifest } from './uiExtensions';

function* addIntegration({ payload: { data, isGlobal, pluginName, callback }, meta }) {
  yield put(showScreenLockAction());
  try {
    const projectKey = yield select(projectKeySelector);
    const integrationUrl = isGlobal
      ? URLS.newGlobalIntegration(pluginName)
      : URLS.newProjectIntegration(projectKey, pluginName);
    const url = resolveIntegrationUrl(integrationUrl, pluginName);
    const response = yield call(fetch, url, {
      method: 'post',
      data,
    });

    const integrationType = yield select(pluginByNameSelector, pluginName);
    const creator = yield select(userIdSelector);
    const newIntegration = {
      ...data,
      integrationParameters: omit(data.integrationParameters, meta[SECRET_FIELDS_KEY]),
      id: response.id,
      integrationType,
      creator,
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
    const projectKey = yield select(projectKeySelector);
    const integrationUrl = isGlobal
      ? URLS.globalIntegration(id)
      : URLS.projectIntegration(projectKey, id);
    const url = resolveIntegrationUrl(integrationUrl, pluginName, id);

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
    yield call(callback, integration);
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
    const projectKey = yield select(projectKeySelector);
    const url = isGlobal ? URLS.globalIntegration(id) : URLS.projectIntegration(projectKey, id);

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
    const projectKey = yield select(projectKeySelector);
    yield call(fetch, URLS.removeProjectIntegrationByType(projectKey, instanceType), {
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

function* fetchPublicPlugins() {
  yield put(fetchDataAction(PUBLIC_PLUGINS, true)(URLS.pluginPublic()));
}

function* watchFetchPlugins() {
  yield takeEvery(FETCH_PLUGINS, fetchPlugins);
}

function* watchFetchPublicPlugins() {
  yield takeEvery(FETCH_PUBLIC_PLUGINS, fetchPublicPlugins);
}

function* removePlugin({ payload: { id, callback, pluginName } }) {
  yield put(showScreenLockAction());
  try {
    yield call(fetch, URLS.pluginById(id), {
      method: 'delete',
    });
    yield put(removePluginSuccessAction(id));
    yield put(removeGlobalIntegrationsByTypeSuccessAction(pluginName));
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

function* watchPluginListFetch() {
  yield takeEvery(
    [createFetchPredicate(NAMESPACE), createFetchPredicate(PUBLIC_PLUGINS)],
    fetchExtensionManifests,
  );
}

function* watchPluginChange() {
  yield takeEvery(UPDATE_PLUGIN_SUCCESS, fetchExtensionManifest);
}

export function* pluginSagas() {
  yield all([
    watchAddIntegration(),
    watchUpdateIntegration(),
    watchRemoveIntegration(),
    watchRemoveIntegrationsByType(),
    watchFetchGlobalIntegrations(),
    watchFetchPlugins(),
    watchFetchPublicPlugins(),
    watchRemovePlugin(),
    watchPluginChange(),
    watchPluginListFetch(),
  ]);
}
