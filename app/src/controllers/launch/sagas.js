import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { debugModeSelector } from 'controllers/launch';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { LATEST } from 'common/constants/reservedFilterIds';
import { activeFilterSelector } from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { updateStorageItem, waitForSelector } from 'common/utils';
import { isEmptyValue } from 'common/utils/isEmptyValue';
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
import { createFilterQuery } from '../../components/filterEntities/containers/utils';

function* fetchLaunchesWithParams({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const params = yield select(queryParametersSelector);
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

const notEmptyConditionsPredicate = ({ value }) => !isEmptyValue(value);

function* fetchLaunches() {
  const filterId = yield select(filterIdSelector);
  if (Number.isInteger(filterId)) {
    yield call(waitForSelector, activeFilterSelector);
  }
  const activeFilter = yield select(activeFilterSelector);
  let filtersQuery = {};
  if (activeFilter) {
    filtersQuery = createFilterQuery(
      activeFilter.conditions
        .filter(notEmptyConditionsPredicate)
        .reduce((res, condition) => ({ ...res, [condition.filteringField]: condition }), {}),
    );
  }
  yield call(fetchLaunchesWithParams, { payload: filtersQuery });
}

function* changeLaunchDistinct({ payload }) {
  updateStorageItem(APPLICATION_SETTINGS, { launchDistinct: payload });
  const filterId = yield select(filterIdSelector);
  if (launchesDistinctLinksSelectorsMap[filterId]) {
    const launchesLink = yield select(launchesDistinctLinksSelectorsMap[payload]);
    yield put(launchesLink);
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
