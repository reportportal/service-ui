/*
 * Copyright 2021 EPAM Systems
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
import { URLS } from 'common/urls';
import { projectKeySelector, projectInfoIdSelector } from 'controllers/project';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { fetchParentItems, fetchParentLaunch, launchSelector } from 'controllers/testItem';
import {
  createFetchPredicate,
  fetchDataAction,
  fetchErrorAction,
  handleError,
} from 'controllers/fetch';
import { FETCH_ERROR } from 'controllers/fetch/constants';
import { canRunPluginCommands } from 'common/utils/permissions';
import {
  launchIdSelector,
  pagePropertiesSelector,
  pathnameChangedSelector,
  locationSelector,
  userRolesSelector,
} from 'controllers/pages';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { unselectAllItemsAction } from 'controllers/groupOperations';
import { NAMESPACE as PLUGINS_NAMESPACE } from 'controllers/plugins/constants';
import { pluginsSelector } from 'controllers/plugins';
import { buildPluginCommandRQ, isPluginCommandForbidden } from 'controllers/plugins/utils';
import { COMMAND_GET_CLUSTERS } from 'controllers/plugins/uiExtensions/constants';
import { queryParametersSelector } from './selectors';
import {
  CLEAR_CLUSTER_ITEMS,
  clusterItemsSagas,
  selectedClusterItemsSelector,
} from './clusterItems';
import { FETCH_CLUSTERS, NAMESPACE, RELOAD_CLUSTERS } from './constants';
import { setPageLoadingAction } from './actionCreators';

function* getPlugin() {
  let plugins = yield select(pluginsSelector);
  const { kind } = yield select(locationSelector);
  const pageIsReloaded = kind === 'load';

  if (!plugins.length && !pageIsReloaded) {
    yield put(fetchDataAction(PLUGINS_NAMESPACE)(URLS.plugin()));
    const response = yield take(createFetchPredicate(PLUGINS_NAMESPACE));
    plugins = response.payload;
  }
  const supportedPlugin = plugins.find((item) =>
    item?.details?.metadata?.supportedFeatures?.includes('uniqueErrorsClusters'),
  );
  if (!supportedPlugin) return null;

  return supportedPlugin.enabled && supportedPlugin;
}

export function* fetchClusters(payload = {}) {
  const { refresh = false } = payload;
  const launchId = yield select(launchIdSelector);
  const parentLaunch = yield select(launchSelector);
  const projectKey = yield select(projectKeySelector);
  const projectId = yield select(projectInfoIdSelector);
  const organizationId = yield select(activeOrganizationIdSelector);
  const isPathNameChanged = yield select(pathnameChangedSelector);
  const selectedItems = yield select(selectedClusterItemsSelector);

  if (selectedItems.length) {
    yield put(unselectAllItemsAction(NAMESPACE)());
  }
  if (isPathNameChanged && !refresh) {
    yield put(setPageLoadingAction(true));
  }
  if (!parentLaunch) {
    yield call(fetchParentItems);
  } else {
    yield call(fetchParentLaunch, { payload: { projectKey, launchId } });
  }

  const query = yield select(queryParametersSelector, NAMESPACE);
  const waitForResult = isPathNameChanged && !refresh;
  const userRoles = yield select(userRolesSelector);
  // Plugin commands need project EDITOR: lower roles use the native endpoint directly.
  const plugin = canRunPluginCommands(userRoles) ? yield call(getPlugin) : null;
  let result = null;
  if (plugin) {
    const uniqueErrorsParams = yield select(pagePropertiesSelector, NAMESPACE);
    const data = buildPluginCommandRQ({
      projectKey,
      projectId,
      organizationId,
      arguments: {
        launchId,
        ...uniqueErrorsParams,
        pageNumber: query[PAGE_KEY],
        pageSize: query[SIZE_KEY],
        pageSort: query[SORTING_KEY],
      },
    });
    yield put(
      fetchDataAction(NAMESPACE, true)(
        URLS.pluginsCommandsCommon(plugin.name, COMMAND_GET_CLUSTERS),
        { method: 'POST', data },
      ),
    );
    result = yield take(createFetchPredicate(NAMESPACE));
    if (result.type === FETCH_ERROR) {
      if (isPluginCommandForbidden(result.payload)) {
        result = null;
      } else {
        yield call(handleError, fetchErrorAction(NAMESPACE, result.payload));
      }
    }
  }
  if (!result) {
    yield put(
      fetchDataAction(NAMESPACE)(
        URLS.clusterByLaunchId(projectKey, launchId, {
          [PAGE_KEY]: query[PAGE_KEY],
          [SIZE_KEY]: query[SIZE_KEY],
          [SORTING_KEY]: query[SORTING_KEY],
        }),
      ),
    );
    if (waitForResult) {
      yield take(createFetchPredicate(NAMESPACE));
    }
  }

  if (waitForResult) {
    yield put(setPageLoadingAction(false));
  }
}

function* reloadClusters() {
  yield put({ type: CLEAR_CLUSTER_ITEMS });
  yield call(fetchClusters, { refresh: true });
}

function* watchFetchClusters() {
  yield takeEvery(FETCH_CLUSTERS, fetchClusters);
}

function* watchReloadClusters() {
  yield takeEvery(RELOAD_CLUSTERS, reloadClusters);
}

export function* uniqueErrorsSagas() {
  yield all([watchFetchClusters(), clusterItemsSagas(), watchReloadClusters()]);
}
