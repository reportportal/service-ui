import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { redirect } from 'redux-first-router';
import { URLS } from 'common/urls';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { debugModeSelector } from 'controllers/launch';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { LATEST } from 'common/constants/reservedFilterIds';
import { launchFiltersSelector } from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { updateStorageItem } from 'common/utils';
import {
  FETCH_LAUNCHES,
  NAMESPACE,
  FETCH_LAUNCHES_WITH_PARAMS,
  CHANGE_LAUNCH_DISTINCT,
} from './constants';
import {
  queryParametersSelector,
  launchDistinctSelector,
  launchesDistinctLinksSelectorsMap,
} from './selectors';

function* fetchLaunchesWithParams({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const params = yield select(queryParametersSelector, NAMESPACE);
  const isDebugMode = yield select(debugModeSelector);
  const queryParams = { ...params, ...payload };
  const launchDistinct = yield select(launchDistinctSelector);
  const urlCreator = launchDistinct === LATEST ? URLS.launchesLatest : URLS.launches;
  yield put(
    fetchDataAction(NAMESPACE)(
      !isDebugMode ? urlCreator(activeProject) : URLS.debug(activeProject),
      { params: queryParams },
    ),
  );
}

function* fetchLaunches() {
  const filterId = yield select(filterIdSelector);
  const filters = yield select(launchFiltersSelector);
  const activeFilter = filters.find((filter) => filter.id === filterId);
  const filtersQuery = activeFilter
    ? activeFilter.conditions.reduce(
        (res, condition) => ({
          ...res,
          [`filter.${condition.condition}.${condition.filteringField}`]: condition.value,
        }),
        {},
      )
    : {};
  yield call(fetchLaunchesWithParams, { payload: filtersQuery });
}

function* changeLaunchDistinct({ payload }) {
  updateStorageItem(APPLICATION_SETTINGS, { launchDistinct: payload });
  const filterId = yield select(filterIdSelector);
  if (launchesDistinctLinksSelectorsMap[filterId]) {
    const launchesLink = yield select(launchesDistinctLinksSelectorsMap[payload]);
    yield put(redirect(launchesLink));
  } else {
    yield call(fetchLaunches);
  }
}

function* watchChangeLaunchDistinct() {
  yield takeEvery(CHANGE_LAUNCH_DISTINCT, changeLaunchDistinct);
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, fetchLaunches);
}

function* watchFetchLaunchesWithParams() {
  yield takeEvery(FETCH_LAUNCHES_WITH_PARAMS, fetchLaunchesWithParams);
}

export function* launchSagas() {
  yield all([watchFetchLaunches(), watchFetchLaunchesWithParams(), watchChangeLaunchDistinct()]);
}
