import { takeEvery, all, put, select, take } from 'redux-saga/effects';
import { redirect } from 'redux-first-router';
import { fetchDataAction, concatFetchDataAction, FETCH_SUCCESS } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import {
  userFiltersSelector,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  toggleDisplayFilterOnLaunchesAction,
} from 'controllers/project';
import { PROJECT_LAUNCHES_PAGE, filterIdSelector } from 'controllers/pages';
import { omit } from 'common/utils/omit';
import { ALL, LATEST, NEW_FILTER_PREFIX } from 'common/constants/reservedFilterIds';
import {
  NAMESPACE,
  FETCH_FILTERS,
  FETCH_FILTERS_CONCAT,
  FETCH_LAUNCHES_FILTERS,
  LAUNCHES_FILTERS_NAMESPACE,
  CHANGE_ACTIVE_FILTER,
  UPDATE_FILTER,
  LAUNCHES_FILTERS_UPDATE_NAMESPACE,
  CREATE_FILTER,
  DEFAULT_FILTER,
  SAVE_NEW_FILTER,
  RESET_FILTER,
  REMOVE_FILTER,
} from './constants';
import { querySelector, savedLaunchesFiltersSelector, launchFiltersSelector } from './selectors';
import {
  addFilterAction,
  changeActiveFilterAction,
  updateFilterSuccessAction,
} from './actionCreators';

const collectFilterIds = (userFilters, activeFilter) => {
  if (userFilters.indexOf(activeFilter) === -1 && activeFilter !== ALL && activeFilter !== LATEST) {
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

function* updateLaunchesFilter({ payload: filter }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(
    fetchDataAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE)(URLS.filter(activeProject, filter.id), {
      method: 'put',
      data: omit(filter, ['id']),
    }),
  );
  yield put(updateFilterSuccessAction(filter));
}

function* changeActiveFilter({ payload: filterId }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(
    redirect({
      type: PROJECT_LAUNCHES_PAGE,
      payload: {
        projectId: activeProject,
        filterId,
      },
    }),
  );
}

function* resetFilter({ payload: filterId }) {
  const savedFilters = yield select(savedLaunchesFiltersSelector);
  const savedFilter = savedFilters.find((filter) => filter.id === filterId);
  yield put(updateFilterSuccessAction(savedFilter));
}

function* createFilter({ payload: filter = {} }) {
  const launchFilters = yield select(launchFiltersSelector);
  const lastNewFilterId = launchFilters.reduce(
    (acc, launchFilter) => (launchFilter.id < acc ? launchFilter.id : acc),
    0,
  );
  const newFilter = {
    ...DEFAULT_FILTER,
    ...filter,
    id: lastNewFilterId - 1,
    name: `${NEW_FILTER_PREFIX} ${-(lastNewFilterId - 1)}`,
  };
  yield put(addFilterAction(newFilter));
  yield put(changeActiveFilterAction(newFilter.id));
}

function* saveNewFilter({ payload: filter }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(
    fetchDataAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE)(URLS.filter(activeProject), {
      method: 'post',
      data: omit(filter, ['id']),
    }),
  );
  const response = yield take(
    ({ type, meta }) =>
      type === FETCH_SUCCESS && meta && meta.namespace === LAUNCHES_FILTERS_UPDATE_NAMESPACE,
  );
  const newId = response.payload.id;
  yield put(updateFilterSuccessAction({ ...filter, id: newId }, filter.id));
  yield put(toggleDisplayFilterOnLaunchesAction(newId));
  yield put(changeActiveFilterAction(newId));
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

function* resetActiveFilter() {
  yield put(changeActiveFilterAction(ALL));
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
  yield takeEvery(REMOVE_FILTER, resetActiveFilter);
}

export function* filterSagas() {
  yield all([
    watchFetchFilters(),
    watchFetchFiltersConcat(),
    watchFetchLaunchesFilters(),
    watchChangeActiveFilter(),
    watchResetFilter(),
    watchUpdateLaunchesFilter(),
    watchCreateFilter(),
    watchSaveNewFilter(),
    watchRemoveFilter(),
  ]);
}
