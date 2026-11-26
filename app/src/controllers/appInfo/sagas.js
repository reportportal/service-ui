/*
 * Copyright 2025 EPAM Systems
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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { call, takeEvery, takeLatest, all, put, select, take } from 'redux-saga/effects';
import {
  fetchStartAction,
  fetchSuccessAction,
  fetchErrorAction,
  createFetchPredicate,
} from 'controllers/fetch';
import { isAuthorizedSelector } from 'controllers/auth/selectors';
import {
  fetchAppInfoAction,
  updateServerSettingsSuccessAction,
} from 'controllers/appInfo/actionCreators';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { APP_INFO_NAMESPACE, FETCH_APP_INFO, UPDATE_SERVER_SETTINGS } from './constants';
import { composeAppInfo } from './utils';

// The API answers /info with a reduced, pre-login payload to anonymous callers and with the full one to a
// signed-in caller. The token is sent only once the session is authorized: a stale token restored from
// storage would be refused with 401 and the login page would get no info at all.
const ANONYMOUS_FETCH_OPTIONS = {
  headers: { Authorization: undefined },
};
const AUTHORIZED_FETCH_OPTIONS = {};

const silentFetch = (...args) => fetch(...args).catch(() => null);

export function* fetchAppInfo() {
  try {
    yield put(fetchStartAction(APP_INFO_NAMESPACE, {}));
    const isAuthorized = yield select(isAuthorizedSelector);
    const [apiInfo, uiInfo] = yield all([
      call(
        fetch,
        URLS.appInfoApi(),
        isAuthorized ? AUTHORIZED_FETCH_OPTIONS : ANONYMOUS_FETCH_OPTIONS,
      ),
      call(silentFetch, URLS.appInfoUi(), ANONYMOUS_FETCH_OPTIONS),
    ]);
    yield put(fetchSuccessAction(APP_INFO_NAMESPACE, composeAppInfo(apiInfo, uiInfo || {})));
  } catch (error) {
    yield put(fetchErrorAction(APP_INFO_NAMESPACE, error, true));
  }
}

function* updateServerSettings({ payload }) {
  const { data, onSuccess = () => {}, onError = () => {} } = payload;
  try {
    yield call(fetch, URLS.instanceSettings(), {
      method: 'put',
      data,
    });
    yield put(updateServerSettingsSuccessAction(data));
    onSuccess();
  } catch (error) {
    onError(error);
    yield put(
      showNotification({
        message: error.message || error,
        type: NOTIFICATION_TYPES.ERROR,
      }),
    );
  }
}

// Loads info for the current session state and waits for the result: called once the session becomes
// authorized, so the full payload is in the store before signed-in pages render.
export function* fetchAppInfoAndWait() {
  yield put(fetchAppInfoAction());
  return yield take(createFetchPredicate(APP_INFO_NAMESPACE));
}

function* watchFetchAppInfo() {
  // the latest request wins: an anonymous response that arrives after sign-in (or a full one that arrives
  // after sign-out) must not overwrite the payload for the current session
  yield takeLatest(FETCH_APP_INFO, fetchAppInfo);
}

function* watchUpdateServerSettings() {
  yield takeEvery(UPDATE_SERVER_SETTINGS, updateServerSettings);
}

export function* appInfoSagas() {
  yield all([watchFetchAppInfo(), watchUpdateServerSettings()]);
}

export function* serverSettingsSagas() {
  yield* appInfoSagas();
}
