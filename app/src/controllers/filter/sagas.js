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

import { takeEvery, all, put, select, call, take } from 'redux-saga/effects';
import {
  fetchDataAction,
  createFetchPredicate,
  concatFetchDataAction,
  FETCH_SUCCESS,
  FETCH_ERROR,
} from 'controllers/fetch';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import {
  userFiltersSelector,
  updateProjectFilterPreferencesAction,
  fetchProjectPreferencesAction,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
} from 'controllers/project';
import { launchDistinctSelector } from 'controllers/launch';
import { PROJECT_LAUNCHES_PAGE } from 'controllers/pages';
import { omit } from 'common/utils/omit';
import { NEW_FILTER_PREFIX } from 'common/constants/reservedFilterIds';
import {
  NAMESPACE,
  FETCH_FILTERS,
  FETCH_FILTERS_CONCAT,
  REMOVE_LAUNCHES_FILTER,
  CHANGE_ACTIVE_FILTER,
  UPDATE_FILTER,
  LAUNCHES_FILTERS_UPDATE_NAMESPACE,
  CREATE_FILTER,
  DEFAULT_FILTER,
  SAVE_NEW_FILTER,
  RESET_FILTER,
  FETCH_FILTERS_PAGE,
} from './constants';
import { querySelector, launchFiltersSelector } from './selectors';
import {
  addFilterAction,
  changeActiveFilterAction,
  updateFilterSuccessAction,
  removeFilterAction,
  setPageLoadingAction,
} from './actionCreators';

function* fetchFilters() {
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.filters(activeProject), {
      params: { ...query },
    }),
  );
}

function* fetchFiltersConcat({ payload: { params, concat } }) {
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);
  yield put(
    concatFetchDataAction(NAMESPACE, concat)(URLS.filters(activeProject), {
      params: { ...query, ...params },
    }),
  );
}

function* updateLaunchesFilter({ payload: filter }) {
  const activeProject = yield select(activeProjectSelector);
  const shallowFilter = {
    ...filter,
    conditions: filter.conditions.filter((item) => item.value.trim()),
  };
  yield put(
    fetchDataAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE)(
      URLS.filter(activeProject, shallowFilter.id),
      {
        method: 'put',
        data: omit(shallowFilter, ['id']),
      },
    ),
  );
  yield put(updateFilterSuccessAction(shallowFilter));
  yield put(
    showNotification({
      messageId: 'updateFilterSuccess',
      type: NOTIFICATION_TYPES.SUCCESS,
    }),
  );
}

function* changeActiveFilter({ payload: filterId }) {
  const activeProject = yield select(activeProjectSelector);
  yield put({
    type: PROJECT_LAUNCHES_PAGE,
    payload: {
      projectId: activeProject,
      filterId,
    },
  });
}

function* resetFilter({ payload: filterId }) {
  const savedFilters = yield select(userFiltersSelector);
  const savedFilter = savedFilters.find((filter) => filter.id === filterId);
  yield put(updateFilterSuccessAction(savedFilter));
}

function* createFilter({ payload: filter = {} }) {
  const launchFilters = yield select(launchFiltersSelector);
  const userId = yield select(userIdSelector);
  const lastNewFilterId = launchFilters.reduce(
    (acc, launchFilter) => (launchFilter.id < acc ? launchFilter.id : acc),
    0,
  );
  const newFilter = {
    ...DEFAULT_FILTER,
    ...filter,
    id: lastNewFilterId - 1,
    name: `${NEW_FILTER_PREFIX} ${-(lastNewFilterId - 1)}`,
    owner: userId,
  };
  yield put(addFilterAction(newFilter));
  yield put(changeActiveFilterAction(newFilter.id));
}

function* saveNewFilter({ payload: filter }) {
  const activeProject = yield select(activeProjectSelector);
  const shallowFilter = {
    ...filter,
    conditions: filter.conditions.filter((item) => item.value.trim()),
  };
  yield put(
    fetchDataAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE)(URLS.filter(activeProject), {
      method: 'post',
      data: omit(shallowFilter, ['id']),
    }),
  );
  const response = yield take(
    ({ type, meta }) =>
      (type === FETCH_SUCCESS || type === FETCH_ERROR) &&
      meta &&
      meta.namespace === LAUNCHES_FILTERS_UPDATE_NAMESPACE,
  );
  if (response.type === FETCH_ERROR) {
    return;
  }
  const newId = response.payload.id;
  const newFilter = { ...shallowFilter, id: newId };
  yield put(updateFilterSuccessAction(newFilter, filter.id));
  yield put(
    showNotification({
      messageId: 'saveFilterSuccess',
      type: NOTIFICATION_TYPES.SUCCESS,
    }),
  );
  yield put(updateProjectFilterPreferencesAction(newFilter.id, 'PUT'));
  yield put(changeActiveFilterAction(newId));
}

function* watchFetchFilters() {
  yield takeEvery(FETCH_FILTERS, fetchFilters);
}

function* watchFetchFiltersConcat() {
  yield takeEvery(FETCH_FILTERS_CONCAT, fetchFiltersConcat);
}

function* resetActiveFilter({ payload: filterId }) {
  const launchDistinct = yield select(launchDistinctSelector);
  yield put(changeActiveFilterAction(launchDistinct));
  yield put(removeFilterAction(filterId));
}

function* watchChangeActiveFilter() {
  yield takeEvery(CHANGE_ACTIVE_FILTER, changeActiveFilter);
}

function* watchResetFilter() {
  yield takeEvery(RESET_FILTER, resetFilter);
}

function* watchUpdateLaunchesFilter() {
  yield takeEvery(UPDATE_FILTER, updateLaunchesFilter);
}

function* watchCreateFilter() {
  yield takeEvery(CREATE_FILTER, createFilter);
}

function* watchSaveNewFilter() {
  yield takeEvery(SAVE_NEW_FILTER, saveNewFilter);
}

function* watchRemoveFilter() {
  yield takeEvery(REMOVE_LAUNCHES_FILTER, resetActiveFilter);
}

function* fetchFiltersPage({ payload: refreshProjectSettings }) {
  yield put(setPageLoadingAction(true));
  yield call(fetchFilters);
  const waitEffects = [take(createFetchPredicate(NAMESPACE))];
  if (refreshProjectSettings) {
    const activeProject = yield select(activeProjectSelector);
    yield put(fetchProjectPreferencesAction(activeProject));
    waitEffects.push(take(FETCH_PROJECT_PREFERENCES_SUCCESS));
  }
  yield all(waitEffects);
  yield put(setPageLoadingAction(false));
}

function* watchFetchFiltersPage() {
  yield takeEvery(FETCH_FILTERS_PAGE, fetchFiltersPage);
}

export function* filterSagas() {
  yield all([
    watchFetchFilters(),
    watchFetchFiltersConcat(),
    watchChangeActiveFilter(),
    watchResetFilter(),
    watchUpdateLaunchesFilter(),
    watchCreateFilter(),
    watchSaveNewFilter(),
    watchRemoveFilter(),
    watchFetchFiltersPage(),
  ]);
}
