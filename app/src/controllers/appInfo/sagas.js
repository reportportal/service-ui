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
import {
  updateServerSettingsAction,
  updateServerSettingsSuccessAction,
} from 'controllers/appInfo/actionCreators';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import {
  SERVER_FOOTER_LINKS_KEY,
  SERVER_SESSION_EXPIRATION_KEY,
  UPDATE_EXPIRATION_SESSION,
  UPDATE_SERVER_FOOTER_LINKS,
  UPDATE_SERVER_SETTINGS,
} from './constants';

function* updateServerSettings({ payload }) {
  const { key, value, onSuccess = () => {} } = payload;
  const data = { key, value };
  try {
    yield call(fetch, URLS.instanceSettings(), {
      method: 'put',
      data,
    });
    yield put(updateServerSettingsSuccessAction(data));
    onSuccess();
  } catch (error) {
    yield put(
      showNotification({
        message: error.message || error,
        type: NOTIFICATION_TYPES.ERROR,
      }),
    );
  }
}

function* updateSessionExpiration({ payload: { expiration, onSuccess } }) {
  yield put(
    updateServerSettingsAction({
      key: SERVER_SESSION_EXPIRATION_KEY,
      value: expiration,
      onSuccess,
    }),
  );
}

function* updateFooterLinks({ payload }) {
  const { footerLinks, onSuccess } = payload;
  yield put(
    updateServerSettingsAction({
      key: SERVER_FOOTER_LINKS_KEY,
      value: JSON.stringify(footerLinks),
      onSuccess,
    }),
  );
}

function* watchUpdateServerSettings() {
  yield takeEvery(UPDATE_SERVER_SETTINGS, updateServerSettings);
}

function* watchUpdateSessionExpiration() {
  yield takeEvery(UPDATE_EXPIRATION_SESSION, updateSessionExpiration);
}

function* watchUpdateFooterLinks() {
  yield takeEvery(UPDATE_SERVER_FOOTER_LINKS, updateFooterLinks);
}

export function* serverSettingsSagas() {
  yield all([
    watchUpdateServerSettings(),
    watchUpdateSessionExpiration(),
    watchUpdateFooterLinks(),
  ]);
}
