import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { BTS_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
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
  ADD_PROJECT_INTEGRATION,
  UPDATE_PROJECT_INTEGRATION,
  REMOVE_PROJECT_INTEGRATION,
  REMOVE_PROJECT_INTEGRATIONS_BY_TYPE,
  ADD_GLOBAL_INTEGRATION,
  UPDATE_GLOBAL_INTEGRATION,
  REMOVE_GLOBAL_INTEGRATION,
} from './constants';
import {
  addProjectIntegrationSuccessAction,
  updateProjectIntegrationSuccessAction,
  removeProjectIntegrationSuccessAction,
  removeProjectIntegrationsByTypeSuccessAction,
  addGlobalIntegrationSuccessAction,
  removeGlobalIntegrationSuccessAction,
  updateGlobalIntegrationSuccessAction,
} from './actionCreators';

function* addIntegration({ payload: { data, isPluginPage, pluginName, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const url = isPluginPage
      ? URLS.newGlobalIntegration(pluginName)
      : URLS.newProjectIntegration(projectId, pluginName);
    const response = yield call(fetch, url, {
      method: 'post',
      data,
    });
    const newIntegration = {
      ...data,
      id: response.id,
      integrationType: { name: pluginName, groupType: BTS_GROUP_TYPE },
    };
    const addIntegrationSuccessAction = isPluginPage
      ? addGlobalIntegrationSuccessAction(newIntegration)
      : addProjectIntegrationSuccessAction(newIntegration);
    yield put(addIntegrationSuccessAction);
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

function* watchAddIntegration() {
  yield takeEvery([ADD_PROJECT_INTEGRATION, ADD_GLOBAL_INTEGRATION], addIntegration);
}

function* updateIntegration({ payload: { data, isPluginPage, id, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const url = isPluginPage ? URLS.globalIntegration(id) : URLS.projectIntegration(projectId, id);

    yield call(fetch, url, {
      method: 'put',
      data,
    });

    const updateIntegrationSuccessAction = isPluginPage
      ? updateGlobalIntegrationSuccessAction(data, id)
      : updateProjectIntegrationSuccessAction(data, id);
    yield put(updateIntegrationSuccessAction);
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

function* watchUpdateIntegration() {
  yield takeEvery([UPDATE_PROJECT_INTEGRATION, UPDATE_GLOBAL_INTEGRATION], updateIntegration);
}

function* removeIntegration({ payload: { id, isPluginPage, callback } }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const url = isPluginPage ? URLS.globalIntegration(id) : URLS.projectIntegration(projectId, id);

    yield call(fetch, url, {
      method: 'delete',
    });

    const removeIntegrationSuccessAction = isPluginPage
      ? removeGlobalIntegrationSuccessAction(id)
      : removeProjectIntegrationSuccessAction(id);
    yield put(removeIntegrationSuccessAction);
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

function* watchRemoveIntegration() {
  yield takeEvery([REMOVE_PROJECT_INTEGRATION, REMOVE_GLOBAL_INTEGRATION], removeIntegration);
}

function* removeIntegrationsByType({ payload: instanceType }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.removeProjectIntegrationByType(projectId, instanceType), {
      method: 'delete',
    });
    yield put(removeProjectIntegrationsByTypeSuccessAction(instanceType));
    yield put(
      showNotification({
        messageId: 'resetToGlobalSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchRemoveIntegrationsByType() {
  yield takeEvery(REMOVE_PROJECT_INTEGRATIONS_BY_TYPE, removeIntegrationsByType);
}

export function* pluginSagas() {
  yield all([
    watchAddIntegration(),
    watchUpdateIntegration(),
    watchRemoveIntegration(),
    watchRemoveIntegrationsByType(),
  ]);
}
