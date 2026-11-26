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

import { put, takeEvery, take, all, call } from 'redux-saga/effects';
import { fetchAppInfoAndWait } from 'controllers/appInfo';
import { FETCH_USER_ERROR, FETCH_USER_SUCCESS, fetchUserAction } from 'controllers/user';
import {
  DEFAULT_TOKEN,
  resetTokenAction,
  TOKEN_KEY,
  setTokenAction,
  authSuccessAction,
} from 'controllers/auth';
import {
  fetchGlobalIntegrationsAction,
  fetchPluginsAction,
  fetchPublicPluginsAction,
} from 'controllers/plugins';
import { getStorageItem } from 'common/utils';
import { setInitialDataReadyAction, setServiceAvailabilityAction } from './actionCreators';
import { FETCH_INITIAL_DATA } from './constants';

export function* fetchInitialData() {
  yield put(setTokenAction(getStorageItem(TOKEN_KEY) || DEFAULT_TOKEN));
  yield put(
    setServiceAvailabilityAction({
      checked: false,
      apiUnavailable: false,
    }),
  );
  // anonymous: the login page needs it even when the restored token turns out to be stale
  const appInfoResult = yield call(fetchAppInfoAndWait);

  if (appInfoResult.error) {
    yield put(setInitialDataReadyAction());
    return;
  }

  yield put(fetchUserAction());
  const userResult = yield take([FETCH_USER_SUCCESS, FETCH_USER_ERROR]);
  if (!userResult.error) {
    yield put(authSuccessAction());
    yield put(fetchPluginsAction());
    yield put(fetchGlobalIntegrationsAction());
    // the session is valid: replace the anonymous info with the full one before any signed-in page renders
    yield call(fetchAppInfoAndWait);
  } else {
    yield put(resetTokenAction());
    yield put(fetchPublicPluginsAction());
  }
  yield put(setInitialDataReadyAction());
}

function* watchFetchInitialData() {
  yield takeEvery(FETCH_INITIAL_DATA, fetchInitialData);
}

export function* initialDataSagas() {
  yield all([watchFetchInitialData()]);
}
