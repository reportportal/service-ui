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

import { delay } from 'redux-saga';
import { takeEvery, takeLatest, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
  showSuccessNotification,
} from 'controllers/notification';
import { fetchDataAction, createFetchPredicate } from 'controllers/fetch';
import { hideModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { fetch, omit } from 'common/utils';
import { userIdSelector } from 'controllers/user';
import { projectKeySelector } from 'controllers/project/selectors';
import { activeOrganizationIdSelector } from 'controllers/organization';
import {
  NAMESPACE,
  FETCH_PLUGINS,
  FETCH_PUBLIC_PLUGINS,
  REMOVE_PLUGIN,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE,
  ADD_INTEGRATION,
  UPDATE_INTEGRATION,
  REMOVE_INTEGRATION,
  FETCH_GLOBAL_INTEGRATIONS,
  SECRET_FIELDS_KEY,
  UPDATE_PLUGIN_SUCCESS,
  PUBLIC_PLUGINS,
  FETCH_MARKETPLACE_CATALOGUE,
  INSTALL_MARKETPLACE_PLUGIN,
  MARKETPLACE_SEARCH_DEBOUNCE,
} from './constants';
import { pluginByNameSelector, marketplaceCatalogueQuerySelector } from './selectors';
import {
  removePluginSuccessAction,
  removeProjectIntegrationsByTypeSuccessAction,
  removeOrganizationIntegrationsByTypeSuccessAction,
  fetchGlobalIntegrationsSuccessAction,
  removeGlobalIntegrationsByTypeSuccessAction,
  fetchMarketplaceCatalogueAction,
  fetchMarketplaceCatalogueStartAction,
  fetchMarketplaceCatalogueSuccessAction,
  fetchMarketplaceCatalogueErrorAction,
  installMarketplacePluginStartAction,
  installMarketplacePluginSuccessAction,
  installMarketplacePluginErrorAction,
} from './actionCreators';
import { fetchExtensionManifests, fetchExtensionManifest } from './uiExtensions';
import {
  getAddIntegrationSuccessAction,
  getAddIntegrationUrl,
  getIntegrationByIdUrl,
  getRemoveIntegrationSuccessAction,
  getUpdateIntegrationSuccessAction,
  normalizeIntegrationItem,
} from './utils';

function* resolveIntegrationContext() {
  const projectKey = yield select(projectKeySelector);
  const organizationId = yield select(activeOrganizationIdSelector);

  return { projectKey, organizationId };
}

function* addIntegration({
  payload: { data, isGlobal, isOrganizational, pluginName, callback },
  meta,
}) {
  yield put(showScreenLockAction());
  try {
    const context = yield resolveIntegrationContext();
    const url = getAddIntegrationUrl({ isGlobal, isOrganizational, pluginName, context });
    const response = yield call(fetch, url, {
      method: 'post',
      data,
    });

    const integrationType = yield select(pluginByNameSelector, pluginName);
    const creator = yield select(userIdSelector);
    const normalizedData = normalizeIntegrationItem(data);
    const newIntegration = {
      ...normalizedData,
      integrationParameters: omit(normalizedData.integrationParameters, meta[SECRET_FIELDS_KEY]),
      id: response.id,
      integrationType,
      creator,
    };
    const addIntegrationSuccessAction = getAddIntegrationSuccessAction({
      isGlobal,
      isOrganizational,
    });
    yield put(addIntegrationSuccessAction(newIntegration));
    yield put(showSuccessNotification({ messageId: 'addIntegrationSuccess' }));
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

function* updateIntegration({
  payload: { data, isGlobal, isOrganizational, id, callback },
  meta = {},
}) {
  yield put(showScreenLockAction());
  try {
    const context = yield resolveIntegrationContext();
    const url = getIntegrationByIdUrl({ isGlobal, isOrganizational, id, context });

    yield call(fetch, url, {
      method: 'put',
      data,
    });

    const normalizedData = normalizeIntegrationItem(data);
    const integration = {
      ...normalizedData,
      integrationParameters: omit(normalizedData.integrationParameters, meta[SECRET_FIELDS_KEY]),
    };
    const updateIntegrationSuccessAction = getUpdateIntegrationSuccessAction({
      isGlobal,
      isOrganizational,
    })(integration, id);
    yield put(updateIntegrationSuccessAction);
    yield put(showSuccessNotification({ messageId: 'updateIntegrationSuccess' }));
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

function* removeIntegration({ payload: { id, isGlobal, isOrganizational, callback } }) {
  yield put(showScreenLockAction());
  try {
    const context = yield resolveIntegrationContext();
    const url = getIntegrationByIdUrl({ isGlobal, isOrganizational, id, context });

    yield call(fetch, url, {
      method: 'delete',
    });

    const removeIntegrationSuccessAction = getRemoveIntegrationSuccessAction({
      isGlobal,
      isOrganizational,
    });
    yield put(removeIntegrationSuccessAction(id));
    yield put(showSuccessNotification({ messageId: 'removeIntegrationSuccess' }));
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
    yield put(showSuccessNotification({ messageId: 'resetToGlobalSuccess' }));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveIntegrationsByType() {
  yield takeEvery(REMOVE_PROJECT_INTEGRATIONS_BY_TYPE, removeIntegrationsByType);
}

function* removeOrganizationIntegrationsByType({ payload: instanceType }) {
  yield put(showScreenLockAction());
  try {
    const organizationId = yield select(activeOrganizationIdSelector);
    yield call(fetch, URLS.removeOrganizationIntegrationsByType(organizationId, instanceType), {
      method: 'delete',
    });
    yield put(removeOrganizationIntegrationsByTypeSuccessAction(instanceType));
    yield put(showSuccessNotification({ messageId: 'resetToGlobalSuccess' }));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveOrganizationIntegrationsByType() {
  yield takeEvery(REMOVE_ORGANIZATION_INTEGRATIONS_BY_TYPE, removeOrganizationIntegrationsByType);
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

export function* fetchMarketplaceCatalogue({ payload = {} } = {}) {
  // typing is debounced, and takeLatest cancels this wait outright when the next keystroke
  // arrives, so the store hears nothing until a request really leaves
  if (payload.debounced) {
    yield call(delay, MARKETPLACE_SEARCH_DEBOUNCE);
  }

  yield put(fetchMarketplaceCatalogueStartAction(payload));
  try {
    const catalogue = yield call(fetch, URLS.marketplaceCatalogue(payload));
    // an OFFLINE registry is part of a successful payload, never an error
    yield put(fetchMarketplaceCatalogueSuccessAction(catalogue));
  } catch (error) {
    // a failed catalogue has to be as loud as any other failed request here: an unexplained
    // page is indistinguishable from an instance that simply has nothing to offer
    yield put(fetchMarketplaceCatalogueErrorAction(error.message));
    yield put(showDefaultErrorNotification(error));
  }
}

// takeLatest, not takeEvery: a slow catalogue response must never land on top of a newer one
export function* watchFetchMarketplaceCatalogue() {
  yield takeLatest(FETCH_MARKETPLACE_CATALOGUE, fetchMarketplaceCatalogue);
}

export function* installMarketplacePlugin({ payload: { registryId, version } }) {
  yield put(installMarketplacePluginStartAction(registryId));
  try {
    // the endpoint requires the version: install, update and rollback differ only by it
    yield call(fetch, URLS.marketplacePluginInstall(registryId), {
      method: 'post',
      data: { version },
    });
    yield put(installMarketplacePluginSuccessAction(registryId));
    // refetch with the filter still on screen, not the unfiltered catalogue
    const query = yield select(marketplaceCatalogueQuerySelector);
    yield put(fetchMarketplaceCatalogueAction(query));
  } catch (error) {
    yield put(installMarketplacePluginErrorAction(registryId, error.message));
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchInstallMarketplacePlugin() {
  yield takeEvery(INSTALL_MARKETPLACE_PLUGIN, installMarketplacePlugin);
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
    watchRemoveOrganizationIntegrationsByType(),
    watchFetchGlobalIntegrations(),
    watchFetchPlugins(),
    watchFetchPublicPlugins(),
    watchRemovePlugin(),
    watchPluginChange(),
    watchPluginListFetch(),
    watchFetchMarketplaceCatalogue(),
    watchInstallMarketplacePlugin(),
  ]);
}
