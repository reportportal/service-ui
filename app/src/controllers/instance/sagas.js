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

import { all, select, put, takeEvery } from 'redux-saga/effects';
import { MONITORING, MEMBERS } from 'common/constants/projectSections';
import { projectSectionSelector } from 'controllers/pages';
import { projectKeySelector, fetchProjectAction } from 'controllers/project';
import { fetchMembersAction } from 'controllers/members';
import { FETCH_PROJECT_DATA } from './constants';
import { allUsersSagas } from './allUsers';
import { eventsSagas, fetchEventsAction } from './events';

const pageDataActions = {
  [MONITORING]: fetchEventsAction,
  [MEMBERS]: fetchMembersAction,
};
function* fetchProjectData() {
  const section = yield select(projectSectionSelector);
  const sectionDataAction = pageDataActions[section] || fetchProjectAction;
  const projectKey = yield select(projectKeySelector);
  const isAdminAccess = true;

  yield put(sectionDataAction(projectKey, isAdminAccess));
}

function* watchFetchProjectData() {
  yield takeEvery(FETCH_PROJECT_DATA, fetchProjectData);
}

export function* instanceSagas() {
  yield all([eventsSagas(), watchFetchProjectData(), allUsersSagas()]);
}
