import { takeEvery, all, put, select, take, call } from 'redux-saga/effects';
import { fetchDataAction, FETCH_SUCCESS, FETCH_ERROR } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { debugModeSelector } from 'controllers/launch';
import { ALL, LATEST } from 'common/constants/reservedFilterIds';
import {
  launchFiltersSelector,
  launchFiltersLoadedSelector,
  LAUNCHES_FILTERS_NAMESPACE,
} from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { FETCH_LAUNCHES, NAMESPACE, FETCH_LAUNCHES_WITH_PARAMS } from './constants';
import { queryParametersSelector } from './selectors';

function* waitForFilters() {
  const filterId = yield select(filterIdSelector);
  const isFiltersLoaded = yield select(launchFiltersLoadedSelector);
  if (!isFiltersLoaded && filterId !== ALL && filterId !== LATEST) {
    yield take(
      ({ type, meta }) =>
        (type === FETCH_SUCCESS || type === FETCH_ERROR) &&
        meta &&
        meta.namespace === LAUNCHES_FILTERS_NAMESPACE,
    );
  }
}

function* fetchLaunchesWithParams({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const params = yield select(queryParametersSelector, NAMESPACE);
  const isDebugMode = yield select(debugModeSelector);
  const queryParams = { ...params, ...payload };
  yield put(
    fetchDataAction(NAMESPACE)(
      !isDebugMode ? URLS.launches(activeProject) : URLS.debug(activeProject),
      { params: queryParams },
    ),
  );
}

function* fetchLaunches() {
  yield call(waitForFilters);
  const filterId = yield select(filterIdSelector);
  const filters = yield select(launchFiltersSelector);
  const activeFilter = filters.find((filter) => filter.id === filterId);
  const filtersQuery = activeFilter
    ? activeFilter.entities.reduce(
        (res, entity) => ({
          ...res,
          [`filter.${entity.condition}.${entity.filteringField}`]: entity.value,
        }),
        {},
      )
    : {};
  yield call(fetchLaunchesWithParams, { payload: filtersQuery });
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, fetchLaunches);
}

function* watchFetchLaunchesWithParams() {
  yield takeEvery(FETCH_LAUNCHES_WITH_PARAMS, fetchLaunchesWithParams);
}

export function* launchSagas() {
  yield all([watchFetchLaunches(), watchFetchLaunchesWithParams()]);
}
