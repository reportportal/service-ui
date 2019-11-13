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

import { take, put, race } from 'redux-saga/effects';
import { showModalAction, hideModalAction } from './actionCreators';
import { HIDE_MODAL, CONFIRM_MODAL } from './constants';

export function* confirmSaga(confirmationModalOptions) {
  yield put(showModalAction(confirmationModalOptions));
  const { confirmed } = yield race({
    confirmed: take(CONFIRM_MODAL),
    cancelled: take(HIDE_MODAL),
  });
  if (confirmed) {
    yield put(hideModalAction());
  }
  return !!confirmed;
}
