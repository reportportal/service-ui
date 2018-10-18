import { takeEvery, all, put, select } from 'redux-saga/effects';
import { redirect } from 'redux-first-router';
import { fetchDataAction, concatFetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { userFiltersSelector, FETCH_PROJECT_PREFERENCES_SUCCESS } from 'controllers/project';
import { PROJECT_LAUNCHES_PAGE, filterIdSelector } from 'controllers/pages';
import {
  NAMESPACE,
  FETCH_FILTERS,
  FETCH_FILTERS_CONCAT,
  FETCH_LAUNCHES_FILTERS,
  LAUNCHES_FILTERS_NAMESPACE,
  CHANGE_ACTIVE_FILTER,
} from './constants';
import { querySelector } from './selectors';

const collectFilterIds = (userFilters, activeFilter) => {
  if (userFilters.indexOf(activeFilter) === -1 && activeFilter !== 'all') {
    return [...userFilters, activeFilter];
  }
  return userFilters;
};

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

function* fetchLaunchesFilters() {
  const activeProject = yield select(activeProjectSelector);
  const userFilters = yield select(userFiltersSelector);
  const activeFilter = yield select(filterIdSelector);
  const filterIds = collectFilterIds(userFilters, activeFilter);
  yield put(
    fetchDataAction(LAUNCHES_FILTERS_NAMESPACE)(URLS.launchesFilters(activeProject, filterIds)),
  );
}

function* changeActiveFilter({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(
    redirect({
      type: PROJECT_LAUNCHES_PAGE,
      payload: {
        projectId: activeProject,
        filterId: payload,
      },
    }),
  );
}

function* watchFetchFilters() {
  yield takeEvery(FETCH_FILTERS, fetchFilters);
}

function* watchFetchFiltersConcat() {
  yield takeEvery(FETCH_FILTERS_CONCAT, fetchFiltersConcat);
}

function* watchFetchLaunchesFilters() {
  yield takeEvery(
    [FETCH_LAUNCHES_FILTERS, FETCH_PROJECT_PREFERENCES_SUCCESS],
    fetchLaunchesFilters,
  );
}

function* watchChangeActiveFilter() {
  yield takeEvery(CHANGE_ACTIVE_FILTER, changeActiveFilter);
}

export function* filterSagas() {
  yield all([
    watchFetchFilters(),
    watchFetchFiltersConcat(),
    watchFetchLaunchesFilters(),
    watchChangeActiveFilter(),
  ]);
}
