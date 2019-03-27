import { takeEvery, takeLatest, all, put, select, call } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import {
  NAMESPACE,
  FETCH_PROJECTS,
  START_SET_VIEW_MODE,
  USER_VIEW,
  GRID_VIEW,
  SET_PROJECTS_VIEW_MODE,
  DELETE_PROJECT,
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

function* deleteProject({ payload: project }) {
  try {
    yield call(fetch, URLS.project(project.id), {
      method: 'delete',
    });
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'deleteError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
  yield put({ type: FETCH_PROJECTS });
}

function* watchDeleteProject() {
  yield takeLatest(DELETE_PROJECT, deleteProject);
}

export function* projectsSagas() {
  yield all([watchFetchProjects(), watchSetViewMode(), watchDeleteProject()]);
}
