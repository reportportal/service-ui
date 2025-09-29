/*
 * Copyright 2024 EPAM Systems
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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import {
  showDefaultErrorNotification,
  showErrorNotification,
  showSuccessNotification,
} from 'controllers/notification';
import { fetchDataAction } from 'controllers/fetch';
import { prepareQueryFilters } from 'components/filterEntities/utils';
import { querySelector } from './selectors';
import {
  FETCH_ORGANIZATIONS,
  FETCH_FILTERED_ORGANIZATIONS,
  NAMESPACE,
  DELETE_ORGANIZATION,
  ERROR_CODES,
} from './constants';
import { fetch } from 'common/utils';

function* fetchOrganizations() {
  try {
    const query = yield select(querySelector);

    yield put(fetchDataAction(NAMESPACE)(URLS.organizationList(query)));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* fetchFilteredOrganizations() {
  const filtersParams = yield select(querySelector);
  const data = prepareQueryFilters(filtersParams);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.organizationSearches(), {
      method: 'post',
      data,
    }),
  );
}

function* deleteOrganization({ payload: { organizationId, onSuccess } }) {
  try {
    yield call(fetch, URLS.organizationById(organizationId), {
      method: 'delete',
    });
    yield put(showSuccessNotification({ messageId: 'deleteOrganizationSuccess' }));
    onSuccess?.();
  } catch ({ errorCode }) {
    yield put(showErrorNotification({ messageId: 'deleteOrganizationError' }));

    if (errorCode === ERROR_CODES.NOT_FOUND) {
      yield fetchFilteredOrganizations();
    }
  }
}

function* watchFetchOrganizations() {
  yield takeEvery(FETCH_ORGANIZATIONS, fetchOrganizations);
}

function* watchFetchFilteredOrganizations() {
  yield takeEvery(FETCH_FILTERED_ORGANIZATIONS, fetchFilteredOrganizations);
}

function* watchDeleteOrganization() {
  yield takeEvery(DELETE_ORGANIZATION, deleteOrganization);
}

export function* organizationsSagas() {
  yield all([
    watchFetchOrganizations(),
    watchFetchFilteredOrganizations(),
    watchDeleteOrganization(),
  ]);
}
