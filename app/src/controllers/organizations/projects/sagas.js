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
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { fetchOrganizationBySlugAction } from '../organization';
import { activeOrganizationSelector } from '../organization/selectors';
import { fetchOrganizationProjectsAction } from './actionCreators';
import { querySelector } from './selectors';
import { CREATE_PROJECT, ERROR_CODES, FETCH_ORGANIZATION_PROJECTS, NAMESPACE } from './constants';

function* fetchOrganizationProjects({ payload: organizationId }) {
  const query = yield select(querySelector);

  yield put(fetchDataAction(NAMESPACE)(URLS.organizationProjects(organizationId, { ...query })));
}

function* watchFetchProjects() {
  yield takeEvery(FETCH_ORGANIZATION_PROJECTS, fetchOrganizationProjects);
}

function* createProject({ payload: { newProjectName: projectName } }) {
  const { id: organizationId, slug: organizationSlug } = yield select(activeOrganizationSelector);
  try {
    yield call(fetch, URLS.organizationProjects(organizationId), {
      method: 'post',
      data: {
        name: projectName,
      },
    });
    yield put(fetchOrganizationBySlugAction(organizationSlug));
    yield put(fetchOrganizationProjectsAction(organizationId));
    yield put(hideModalAction());
    yield put(
      showNotification({
        messageId: 'addProjectSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
        values: { name: projectName },
      }),
    );
  } catch (err) {
    if (err.errorCode === ERROR_CODES.PROJECT_EXISTS) {
      yield put(
        showNotification({
          messageId: 'projectExists',
          type: NOTIFICATION_TYPES.ERROR,
          values: { name: projectName },
        }),
      );
    } else {
      yield put(
        showNotification({
          messageId: 'failureDefault',
          type: NOTIFICATION_TYPES.ERROR,
          values: { error: err.message },
        }),
      );
    }
  }
}

function* watchCreateProject() {
  yield takeEvery(CREATE_PROJECT, createProject);
}

export function* projectsSagas() {
  yield all([watchFetchProjects(), watchCreateProject()]);
}
