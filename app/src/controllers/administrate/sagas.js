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
  if (!section || !pageDataActions[section]) {
    return;
  }
  const projectId = yield select(projectIdSelector);
  const isAdminAccess = true;
  yield put(pageDataActions[section](projectId, isAdminAccess));
}

function* watchFetchProjectData() {
  yield takeEvery(FETCH_PROJECT_DATA, fetchProjectData);
}

export function* administrateSagas() {
  yield all([eventsSagas(), watchFetchProjectData(), allUsersSagas(), projectsSagas()]);
}
