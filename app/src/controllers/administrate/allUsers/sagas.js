import { takeEvery, all, put, select } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetchDataAction } from 'controllers/fetch';
import { NAMESPACE, FETCH_ALL_USERS } from './constants';
import { querySelector } from './selectors';

function* fetchAllUsers() {
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.allUsers(), {
      params: { ...query },
    }),
  );
}

function* watchFetchAllUsers() {
  yield takeEvery(FETCH_ALL_USERS, fetchAllUsers);
}

export function* allUsersSagas() {
  yield all([watchFetchAllUsers()]);
}
