import { all, select, put, takeEvery } from 'redux-saga/effects';
import { EVENTS } from 'common/constants/projectSections';
import { projectSectionSelector } from 'controllers/pages';
import { projectSaga } from './project';
import { eventsSagas, fetchEventsAction } from './events';
import { FETCH_PROJECT_DATA } from './constants';

const pageDataActions = {
  [EVENTS]: fetchEventsAction,
};
function* fetchProjectData() {
  const section = yield select(projectSectionSelector);
  if (!section || !pageDataActions[section]) {
    return;
  }
  yield put(pageDataActions[section]());
}

function* watchFetchProjectData() {
  yield takeEvery(FETCH_PROJECT_DATA, fetchProjectData);
}

export function* administrateSaga() {
  yield all([projectSaga(), eventsSagas(), watchFetchProjectData()]);
}
