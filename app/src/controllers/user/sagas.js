import { takeLatest, call, all, put, select } from 'redux-saga/effects';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import { userIdSelector } from './selectors';
import { ASSIGN_TO_RROJECT, UNASSIGN_FROM_PROJECT } from './constants';
import {
  assignToProjectSuccessAction,
  assignToProjectErrorAction,
  unassignFromProjectSuccessAction,
} from './actionCreators';

function* assignToProject({ payload: project }) {
  const userId = yield select(userIdSelector);
  const userRole = PROJECT_MANAGER;
  const data = {
    userNames: {
      [userId]: userRole,
    },
  };
  try {
    yield call(fetch, URLS.userInviteInternal(project.projectName), {
      method: 'put',
      data,
    });
    yield put(
      assignToProjectSuccessAction({
        projectName: project.projectName,
        projectRole: userRole,
        entryType: project.entryType,
      }),
    );
    yield put(
      showNotification({
        messageId: 'assignSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      assignToProjectErrorAction({
        projectName: project.projectName,
        projectRole: userRole,
        entryType: project.entryType,
      }),
    );
    yield put(
      showNotification({
        messageId: 'assignError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* unassignFromProject({ payload: project }) {
  const userId = yield select(userIdSelector);
  const data = {
    userNames: [userId],
  };
  try {
    yield call(fetch, URLS.userUnasign(project.projectName), {
      method: 'put',
      data,
    });
    yield put(unassignFromProjectSuccessAction(project));
    yield put(
      showNotification({
        messageId: 'unassignSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'unassignError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* watchAssignToProject() {
  yield takeLatest(ASSIGN_TO_RROJECT, assignToProject);
}

function* watchUnassignFromProject() {
  yield takeLatest(UNASSIGN_FROM_PROJECT, unassignFromProject);
}

export function* userSagas() {
  yield all([watchAssignToProject(), watchUnassignFromProject()]);
}
