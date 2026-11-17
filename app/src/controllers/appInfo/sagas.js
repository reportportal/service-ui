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
import { call, takeEvery, all, put } from 'redux-saga/effects';
import { fetchStartAction, fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { updateServerSettingsSuccessAction } from 'controllers/appInfo/actionCreators';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { APP_INFO_NAMESPACE, FETCH_APP_INFO, UPDATE_SERVER_SETTINGS } from './constants';
import { composeAppInfo } from './utils';

const APP_INFO_FETCH_OPTIONS = {
  headers: { Authorization: undefined },
};

const silentFetch = (...args) => fetch(...args).catch(() => null);

function* fetchAppInfo() {
  try {
    yield put(fetchStartAction(APP_INFO_NAMESPACE, {}));
    const [apiInfo, uiInfo] = yield all([
      call(fetch, URLS.appInfoApi(), APP_INFO_FETCH_OPTIONS),
      call(silentFetch, URLS.appInfoUi(), APP_INFO_FETCH_OPTIONS),
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

function* watchFetchAppInfo() {
  yield takeEvery(FETCH_APP_INFO, fetchAppInfo);
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
