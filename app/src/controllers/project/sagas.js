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
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import {
  addFilterAction,
  fetchUserFiltersSuccessAction,
  removeFilterAction,
} from 'controllers/filter';

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
  PA_ATTRIBUTE_ENABLED_KEY,
  UPDATE_PA_STATE,
  FETCH_PROJECT,
  FETCH_PROJECT_PREFERENCES,
  FETCH_CONFIGURATION_ATTRIBUTES,
  HIDE_FILTER_ON_LAUNCHES,
  SHOW_FILTER_ON_LAUNCHES,
  UPDATE_PROJECT_FILTER_PREFERENCES,
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
  updateConfigurationAttributesAction,
  fetchProjectPreferencesAction,
  fetchProjectSuccessAction,
  fetchProjectPreferencesSuccessAction,
  updateProjectFilterPreferencesAction,
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
    const newIntegration = {
      ...data,
      id: response.id,
      integrationType: { name: pluginName, groupType: BTS_GROUP_TYPE },
    };
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

function* updatePAState({ payload: PAEnabled }) {
  yield put(showScreenLockAction());
  try {
    const projectId = yield select(projectIdSelector);
    const updatedConfig = {
      configuration: {
        attributes: {
          [PA_ATTRIBUTE_ENABLED_KEY]: PAEnabled.toString(),
        },
      },
    };

    yield call(fetch, URLS.project(projectId), {
      method: 'put',
      data: updatedConfig,
    });
    yield put(updateConfigurationAttributesAction(updatedConfig));
    yield put(
      showNotification({
        messageId: 'updatePAStateSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdatePAState() {
  yield takeEvery(UPDATE_PA_STATE, updatePAState);
}

function* fetchProject({ payload: { projectId, isAdminAccess } }) {
  const project = yield call(fetch, URLS.project(projectId));
  yield put(fetchProjectSuccessAction(project));
  if (!isAdminAccess) {
    yield put(fetchProjectPreferencesAction(projectId));
  }
}

function* watchFetchProject() {
  yield takeEvery(FETCH_PROJECT, fetchProject);
}

function* fetchProjectPreferences({ payload: projectId }) {
  const userId = yield select(userIdSelector);
  const preferences = yield call(fetch, URLS.projectPreferences(projectId, userId));
  yield put(fetchProjectPreferencesSuccessAction(preferences));
  yield put(fetchUserFiltersSuccessAction(preferences.filters));
}

function* watchFetchProjectPreferences() {
  yield takeEvery(FETCH_PROJECT_PREFERENCES, fetchProjectPreferences);
}

function* fetchConfigurationAttributes({ payload: projectId }) {
  const project = yield call(fetch, URLS.project(projectId));
  yield put(updateConfigurationAttributesAction(project));
}

function* watchFetchConfigurationAttributes() {
  yield takeEvery(FETCH_CONFIGURATION_ATTRIBUTES, fetchConfigurationAttributes);
}

function* hideFilterOnLaunches({ payload: filter }) {
  yield put(removeFilterAction(filter.id));
  yield put(updateProjectFilterPreferencesAction(filter.id, 'DELETE'));
}

function* watchHideFilterOnLaunches() {
  yield takeEvery(HIDE_FILTER_ON_LAUNCHES, hideFilterOnLaunches);
}

function* showFilterOnLaunches({ payload: filter }) {
  yield put(addFilterAction(filter));
  yield put(updateProjectFilterPreferencesAction(filter.id, 'PUT'));
}

function* watchShowFilterOnLaunches() {
  yield takeEvery(SHOW_FILTER_ON_LAUNCHES, showFilterOnLaunches);
}

function* updateProjectFilterPreferences({ payload = {} }) {
  const { filterId, method } = payload;
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  yield call(fetch, URLS.projectPreferences(activeProject, userId, filterId), { method });
}

function* watchUpdateProjectFilterPreferences() {
  yield takeEvery(UPDATE_PROJECT_FILTER_PREFERENCES, updateProjectFilterPreferences);
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
    watchUpdatePAState(),
    watchDeletePattern(),
    watchFetchProject(),
    watchFetchProjectPreferences(),
    watchFetchConfigurationAttributes(),
    watchHideFilterOnLaunches(),
    watchShowFilterOnLaunches(),
    watchUpdateProjectFilterPreferences(),
  ]);
}
