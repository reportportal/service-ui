import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_FILTERS } from './constants';

function* fetchFilters({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.filters(activeProject), payload));
}

function* watchFetchFilters() {
  yield takeEvery(FETCH_FILTERS, fetchFilters);
}

export function* filterSagas() {
  yield all([watchFetchFilters()]);
}
