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
  ADD_PROJECT_INTEGRATION,
  UPDATE_PROJECT_INTEGRATION,
  REMOVE_PROJECT_INTEGRATION,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  ADD_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
} from './constants';
import {
  updateDefectSubTypeSuccessAction,
  addDefectSubTypeSuccessAction,
  deleteDefectSubTypeSuccessAction,
  updateProjectNotificationsConfigSuccessAction,
  addProjectIntegrationSuccessAction,
  updateProjectIntegrationSuccessAction,
  removeProjectIntegrationSuccessAction,
  removeProjectIntegrationsByTypeSuccessAction,
  addPatternSuccessAction,
  updatePatternSuccessAction,
  deletePatternSuccessAction,
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

function* addProjectIntegration({ payload: { data, pluginName, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const response = yield call(fetch, URLS.newProjectIntegration(projectId, pluginName), {
      method: 'post',
      data,
    });
    const newIntegration = { ...data, id: response.id, integrationType: { name: pluginName } };
    yield put(addProjectIntegrationSuccessAction(newIntegration));
    yield put(
      showNotification({
        messageId: 'addIntegrationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
    yield call(callback, newIntegration);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchAddProjectIntegration() {
  yield takeEvery(ADD_PROJECT_INTEGRATION, addProjectIntegration);
}

function* updateProjectIntegration({ payload: { data, id, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectIntegration(projectId, id), {
      method: 'put',
      data,
    });
    yield put(updateProjectIntegrationSuccessAction(data, id));
    yield put(
      showNotification({
        messageId: 'updateIntegrationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield call(callback);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateProjectIntegration() {
  yield takeEvery(UPDATE_PROJECT_INTEGRATION, updateProjectIntegration);
}

function* removeProjectIntegration({ payload: { id, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectIntegration(projectId, id), {
      method: 'delete',
    });
    yield put(removeProjectIntegrationSuccessAction(id));
    yield put(
      showNotification({
        messageId: 'removeIntegrationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield call(callback);
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveProjectIntegration() {
  yield takeEvery(REMOVE_PROJECT_INTEGRATION, removeProjectIntegration);
}

function* removeProjectIntegrationsByType({ payload: instanceType }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.removeProjectIntegrationByType(projectId, instanceType), {
      method: 'delete',
    });
    yield put(removeProjectIntegrationsByTypeSuccessAction(instanceType));
    yield put(
      showNotification({
        messageId: 'returnToGlobalSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveProjectIntegrationsByType() {
  yield takeEvery(REMOVE_PROJECT_INTEGRATIONS_BY_TYPE, removeProjectIntegrationsByType);
}

function* addPattern({ payload: pattern }) {
  try {
    const projectId = yield select(projectIdSelector);
    const response = yield call(fetch, URLS.projectAddPattern(projectId), {
      method: 'post',
      data: pattern,
    });
    yield put(addPatternSuccessAction({ ...pattern, ...response }));
    yield put(
      showNotification({
        messageId: 'addPatternSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchAddPattern() {
  yield takeEvery(ADD_PATTERN, addPattern);
}

function* updatePattern({ payload: pattern }) {
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectUpdatePattern(projectId, pattern.id), {
      method: 'put',
      data: {
        name: pattern.name,
        enabled: pattern.enabled,
      },
    });
    yield put(updatePatternSuccessAction(pattern));
    yield put(
      showNotification({
        messageId: 'updatePatternSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchUpdatePattern() {
  yield takeEvery(UPDATE_PATTERN, updatePattern);
}

function* deletePattern({ payload: pattern }) {
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectUpdatePattern(projectId, pattern.id), { method: 'delete' });
    yield put(deletePatternSuccessAction(pattern));
    yield put(
      showNotification({
        messageId: 'deletePatternSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchDeletePattern() {
  yield takeEvery(DELETE_PATTERN, deletePattern);
}

export function* projectSagas() {
  yield all([
    watchUpdateDefectSubType(),
    watchAddDefectSubType(),
    watchDeleteDefectSubType(),
    watchUpdateProjectNotificationsConfig(),
    watchAddProjectIntegration(),
    watchUpdateProjectIntegration(),
    watchRemoveProjectIntegration(),
    watchRemoveProjectIntegrationsByType(),
    watchAddPattern(),
    watchUpdatePattern(),
    watchDeletePattern(),
  ]);
}
