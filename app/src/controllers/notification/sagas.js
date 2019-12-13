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

import { delay } from 'redux-saga';
import { all, call, takeEvery, put } from 'redux-saga/effects';
import {
  SHOW_NOTIFICATION,
  SHOW_DEFAULT_ERROR_NOTIFICATION,
  NOTIFICATION_TYPES,
} from './constants';
import { hideNotification, showNotification } from './actionCreators';

function* showDefaultErrorNotification({ payload: { error } }) {
  yield put(
    showNotification({
      messageId: 'failureDefault',
      type: NOTIFICATION_TYPES.ERROR,
      values: { error },
    }),
  );
}

function* watchShowDefaultErrorNotification() {
  yield takeEvery(SHOW_DEFAULT_ERROR_NOTIFICATION, showDefaultErrorNotification);
}

function* hideNotificationDelay({ payload }) {
  yield call(delay, 8000);
  yield put(hideNotification(payload.uid));
}

function* watchAddNotification() {
  yield takeEvery(SHOW_NOTIFICATION, hideNotificationDelay);
}

export function* notificationSagas() {
  yield all([watchAddNotification(), watchShowDefaultErrorNotification()]);
}
