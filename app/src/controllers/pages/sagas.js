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

import { put, takeEvery, select, all } from 'redux-saga/effects';
import isEqual from 'fast-deep-equal';
import { mergeQuery } from 'common/utils/routingUtils';
import { UPDATE_PAGE_PROPERTIES } from './constants';
import { locationSelector } from './selectors';

function* updatePageProperties({ payload: properties }) {
  const { type, payload, query } = yield select(locationSelector);
  const newQuery = mergeQuery(query, properties);

  if (isEqual(query, newQuery)) {
    return;
  }

  const updatedAction = {
    type,
    payload,
    meta: { query: newQuery },
  };

  yield put(updatedAction);
}

function* watchUpdatePageProperties() {
  yield takeEvery(UPDATE_PAGE_PROPERTIES, updatePageProperties);
}

export function* pageSagas() {
  yield all([watchUpdatePageProperties()]);
}
