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

import { all, select, put, takeEvery } from 'redux-saga/effects';
import { EVENTS, SETTINGS, MEMBERS } from 'common/constants/projectSections';
import { projectSectionSelector, projectIdSelector } from 'controllers/pages';
import { fetchProjectAction } from 'controllers/project';
import { fetchMembersAction } from 'controllers/members';
import { eventsSagas, fetchEventsAction } from './events';
import { allUsersSagas } from './allUsers';
import { projectsSagas } from './projects';
import { FETCH_PROJECT_DATA } from './constants';

const pageDataActions = {
  [EVENTS]: fetchEventsAction,
  [SETTINGS]: fetchProjectAction,
  [MEMBERS]: fetchMembersAction,
};
function* fetchProjectData() {
  const section = yield select(projectSectionSelector);
  const sectionDataAction = pageDataActions[section] || fetchProjectAction;
  const projectId = yield select(projectIdSelector);
  const isAdminAccess = true;

  yield put(sectionDataAction(projectId, isAdminAccess));
}

function* watchFetchProjectData() {
  yield takeEvery(FETCH_PROJECT_DATA, fetchProjectData);
}

export function* administrateSagas() {
  yield all([eventsSagas(), watchFetchProjectData(), allUsersSagas(), projectsSagas()]);
}
