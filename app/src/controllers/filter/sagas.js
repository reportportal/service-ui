import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction, concatFetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_FILTERS, FETCH_FILTERS_CONCAT } from './constants';
import { querySelector } from './selectors';

function* fetchFilters() {
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.filters(activeProject), {
      params: { ...query },
    }),
  );
}

function* fetchFiltersConcat({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);

  yield put(
    concatFetchDataAction(NAMESPACE, payload.filters)(URLS.filters(activeProject), {
      params: { ...query, ...payload.params },
    }),
  );
}

function* watchFetchFilters() {
  yield takeEvery(FETCH_FILTERS, fetchFilters);
}

function* watchFetchFiltersConcat() {
  yield takeEvery(FETCH_FILTERS_CONCAT, fetchFiltersConcat);
}

export function* filterSagas() {
  yield all([watchFetchFilters(), watchFetchFiltersConcat()]);
}
