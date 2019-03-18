import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { getStorageItem, setStorageItem } from 'common/utils';
import {
  NAMESPACE,
  FETCH_PROJECTS,
  START_SET_VIEW_MODE,
  USER_VIEW,
  GRID_VIEW,
  SET_PROJECTS_VIEW_MODE,
} from './constants';
import { querySelector } from './selectors';

function* fetchProjects() {
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.projects(), {
      params: { ...query },
    }),
  );
}

function* watchFetchProjects() {
  yield takeEvery(FETCH_PROJECTS, fetchProjects);
}

function* setViewMode(action) {
  const userView = getStorageItem(USER_VIEW) || GRID_VIEW;
  const viewMode = action.payload.viewMode || userView;

  setStorageItem(USER_VIEW, viewMode);

  yield put({ type: SET_PROJECTS_VIEW_MODE, payload: viewMode });
}
function* watchSetViewMode() {
  yield takeEvery(START_SET_VIEW_MODE, setViewMode);
}

export function* projectsSagas() {
  yield all([watchFetchProjects(), watchSetViewMode()]);
}
