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

import { takeEvery, all, put, select } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetchDataAction } from 'controllers/fetch';
import { querySelector } from './selectors';
import { NAMESPACE, FETCH_ALL_USERS } from './constants';

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
