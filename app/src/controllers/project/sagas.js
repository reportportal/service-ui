import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { projectIdSelector } from 'controllers/pages';
import { hideModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { fetch } from 'common/utils';

import {
  UPDATE_DEFECT_SUBTYPE,
  ADD_DEFECT_SUBTYPE,
  DELETE_DEFECT_SUBTYPE,
  UPDATE_NOTIFICATIONS_CONFIG,
} from './constants';
import {
  updateDefectSubTypeSuccessAction,
  addDefectSubTypeSuccessAction,
  deleteDefectSubTypeSuccessAction,
  updateProjectNotificationsConfigSuccessAction,
} from './actionCreators';
import { projectNotificationsConfigurationSelector } from './selectors';

function* updateDefectSubType({ payload: subTypes }) {
  try {
    const projectId = yield select(projectIdSelector);
    const data = {
      ids: subTypes,
    };
    yield call(fetch, URLS.projectDefectSubType(projectId), {
      method: 'put',
      data,
    });
    yield put(updateDefectSubTypeSuccessAction(subTypes));
    yield put(
      showNotification({
        messageId: 'updateDefectSubTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchUpdateDefectSubType() {
  yield takeEvery(UPDATE_DEFECT_SUBTYPE, updateDefectSubType);
}

function* addDefectSubType({ payload: subType }) {
  try {
    const projectId = yield select(projectIdSelector);
    const response = yield call(fetch, URLS.projectDefectSubType(projectId), {
      method: 'post',
      data: subType,
    });
    yield put(addDefectSubTypeSuccessAction({ ...response, ...subType }));
    yield put(
      showNotification({
        messageId: 'updateDefectSubTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchAddDefectSubType() {
  yield takeEvery(ADD_DEFECT_SUBTYPE, addDefectSubType);
}

function* deleteDefectSubType({ payload: subType }) {
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectDeleteDefectSubType(projectId, subType.id), {
      method: 'delete',
    });
    yield put(deleteDefectSubTypeSuccessAction(subType));
    yield put(
      showNotification({
        messageId: 'deleteDefectSubTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchDeleteDefectSubType() {
  yield takeEvery(DELETE_DEFECT_SUBTYPE, deleteDefectSubType);
}

function* updateProjectNotificationsConfig({ payload: notificationsConfig }) {
  yield put(showScreenLockAction());
  try {
    const currentConfig = yield select(projectNotificationsConfigurationSelector);
    const projectId = yield select(projectIdSelector);
    const newConfig = { ...currentConfig, ...notificationsConfig };

    yield call(fetch, URLS.projectNotificationConfiguration(projectId), {
      method: 'put',
      data: newConfig,
    });
    yield put(updateProjectNotificationsConfigSuccessAction(newConfig));
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateProjectNotificationsConfig() {
  yield takeEvery(UPDATE_NOTIFICATIONS_CONFIG, updateProjectNotificationsConfig);
}

export function* projectSagas() {
  yield all([
    watchUpdateDefectSubType(),
    watchAddDefectSubType(),
    watchDeleteDefectSubType(),
    watchUpdateProjectNotificationsConfig(),
  ]);
}
