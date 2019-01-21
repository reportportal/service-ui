import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { debugModeSelector } from 'controllers/launch';
import { LATEST } from 'common/constants/reservedFilterIds';
import { launchFiltersSelector } from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { FETCH_LAUNCHES, NAMESPACE, FETCH_LAUNCHES_WITH_PARAMS } from './constants';
import { queryParametersSelector } from './selectors';

function* fetchLaunchesWithParams({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const params = yield select(queryParametersSelector, NAMESPACE);
  const isDebugMode = yield select(debugModeSelector);
  const queryParams = { ...params, ...payload };
  const filterId = yield select(filterIdSelector);
  const urlCreator = filterId === LATEST ? URLS.launchesLatest : URLS.launches;
  yield put(
    fetchDataAction(NAMESPACE)(
      !isDebugMode ? urlCreator(activeProject) : URLS.debug(activeProject),
      { params: queryParams },
    ),
  );
}

const notEmptyConditionsPredicate = ({ value }) =>
  value !== '' && value !== null && value !== undefined;

function* fetchLaunches() {
  const filterId = yield select(filterIdSelector);
  const filters = yield select(launchFiltersSelector);
  const activeFilter = filters.find((filter) => filter.id === filterId);
  const filtersQuery = activeFilter
    ? activeFilter.conditions.filter(notEmptyConditionsPredicate).reduce(
        (res, condition) => ({
          ...res,
          [`filter.${condition.condition}.${condition.filteringField}`]: condition.value,
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
