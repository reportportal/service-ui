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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { hideModalAction } from 'controllers/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { fetch } from 'common/utils';
import { userIdSelector } from 'controllers/user';
import { setProjectIntegrationsAction } from 'controllers/plugins';
import {
  addFilterAction,
  fetchUserFiltersSuccessAction,
  removeFilterAction,
  activeFilterSelector,
} from 'controllers/filter';

import { urlProjectKeySelector } from 'controllers/pages';
import {
  UPDATE_DEFECT_TYPE,
  ADD_DEFECT_TYPE,
  DELETE_DEFECT_TYPE,
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
  ADD_PROJECT_NOTIFICATION,
  NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY,
  UPDATE_NOTIFICATION_STATE,
  UPDATE_PROJECT_NOTIFICATION,
  DELETE_PROJECT_NOTIFICATION,
  FETCH_PROJECT_NOTIFICATIONS,
} from './constants';
import {
  updateDefectTypeSuccessAction,
  addDefectTypeSuccessAction,
  deleteDefectTypeSuccessAction,
  addPatternSuccessAction,
  updatePatternSuccessAction,
  deletePatternSuccessAction,
  updateConfigurationAttributesAction,
  fetchProjectPreferencesAction,
  fetchProjectSuccessAction,
  fetchProjectPreferencesSuccessAction,
  updateProjectFilterPreferencesAction,
  addProjectNotificationSuccessAction,
  fetchProjectNotificationsSuccessAction,
  deleteProjectNotificationSuccessAction,
  updateProjectNotificationSuccessAction,
  setProjectNotificationsLoadingAction,
} from './actionCreators';
import { patternsSelector, projectKeySelector } from './selectors';

function* updateDefectType({ payload: defectTypes }) {
  yield put(showScreenLockAction());
  try {
    const projectKey = yield select(urlProjectKeySelector);
    const data = {
      ids: defectTypes,
    };
    yield call(fetch, URLS.projectDefectType(projectKey), {
      method: 'put',
      data,
    });
    yield put(updateDefectTypeSuccessAction(defectTypes));
    yield put(
      showNotification({
        messageId: 'updateDefectTypeSuccess',
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

function* watchUpdateDefectType() {
  yield takeEvery(UPDATE_DEFECT_TYPE, updateDefectType);
}

function* addDefectType({ payload: defectType }) {
  yield put(showScreenLockAction());
  try {
    const projectKey = yield select(urlProjectKeySelector);
    const response = yield call(fetch, URLS.projectDefectType(projectKey), {
      method: 'post',
      data: defectType,
    });
    yield put(addDefectTypeSuccessAction({ ...response, ...defectType }));
    yield put(
      showNotification({
        messageId: 'addDefectTypeSuccess',
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

function* watchAddDefectType() {
  yield takeEvery(ADD_DEFECT_TYPE, addDefectType);
}

function* deleteDefectType({ payload: defectType }) {
  yield put(showScreenLockAction());
  try {
    const projectKey = yield select(urlProjectKeySelector);
    yield call(fetch, URLS.projectDeleteDefectType(projectKey, defectType.id), {
      method: 'delete',
    });
    yield put(deleteDefectTypeSuccessAction(defectType));
    yield put(
      showNotification({
        messageId: 'deleteDefectTypeSuccess',
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

function* watchDeleteDefectType() {
  yield takeEvery(DELETE_DEFECT_TYPE, deleteDefectType);
}

function* fetchProjectNotifications() {
  yield put(setProjectNotificationsLoadingAction(true));
  try {
    const projectKey = yield select(urlProjectKeySelector);
    const notifications = yield call(fetch, URLS.notification(projectKey));
    yield put(fetchProjectNotificationsSuccessAction(notifications));
  } finally {
    yield put(setProjectNotificationsLoadingAction(false));
  }
}

function* watchFetchProjectNotifications() {
  yield takeEvery(FETCH_PROJECT_NOTIFICATIONS, fetchProjectNotifications);
}

function* addProjectNotification({ payload: notification }) {
  try {
    const projectKey = yield select(urlProjectKeySelector);

    const response = yield call(fetch, URLS.notification(projectKey), {
      method: 'post',
      data: notification,
    });

    yield put(addProjectNotificationSuccessAction({ ...notification, ...response }));
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(hideModalAction());
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchAddProjectNotification() {
  yield takeEvery(ADD_PROJECT_NOTIFICATION, addProjectNotification);
}

function* updateProjectNotification({ payload: notification }) {
  yield put(showScreenLockAction());
  try {
    const projectKey = yield select(urlProjectKeySelector);

    yield call(fetch, URLS.notification(projectKey), {
      method: 'put',
      data: notification,
    });
    yield put(updateProjectNotificationSuccessAction(notification));
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

function* watchUpdateProjectNotification() {
  yield takeEvery(UPDATE_PROJECT_NOTIFICATION, updateProjectNotification);
}

function* deleteProjectNotification({ payload: id }) {
  yield put(showScreenLockAction());
  try {
    const projectKey = yield select(urlProjectKeySelector);

    yield call(fetch, URLS.notificationById(projectKey, id), {
      method: 'delete',
    });
    yield put(deleteProjectNotificationSuccessAction(id));
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

function* watchDeleteProjectNotification() {
  yield takeEvery(DELETE_PROJECT_NOTIFICATION, deleteProjectNotification);
}

function* updateNotificationState(enabled) {
  const projectKey = yield select(urlProjectKeySelector);
  const updatedConfig = {
    configuration: {
      attributes: {
        [NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY]: enabled.toString(),
      },
    },
  };

  yield call(fetch, URLS.project(projectKey), {
    method: 'put',
    data: updatedConfig,
  });
  yield put(updateConfigurationAttributesAction(updatedConfig));
}

function* updateNotificationStateWithNotification({ payload: enabled }) {
  yield put(showScreenLockAction());
  try {
    yield call(updateNotificationState, enabled);
    yield put(
      showNotification({
        messageId: 'updateProjectNotificationsConfigurationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  } finally {
    yield put(hideScreenLockAction());
  }
}

function* watchUpdateNotificationState() {
  yield takeEvery(UPDATE_NOTIFICATION_STATE, updateNotificationStateWithNotification);
}

function* updatePAState(PAEnabled) {
  const projectKey = yield select(urlProjectKeySelector);
  const updatedConfig = {
    configuration: {
      attributes: {
        [PA_ATTRIBUTE_ENABLED_KEY]: PAEnabled.toString(),
      },
    },
  };

  yield call(fetch, URLS.project(projectKey), {
    method: 'put',
    data: updatedConfig,
  });
  yield put(updateConfigurationAttributesAction(updatedConfig));
}

function* addPattern({ payload: pattern }) {
  try {
    const projectKey = yield select(urlProjectKeySelector);
    const response = yield call(fetch, URLS.projectAddPattern(projectKey), {
      method: 'post',
      data: pattern,
    });
    const patterns = yield select(patternsSelector);
    if (!patterns.length) {
      yield call(updatePAState, true);
    }
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
    const projectKey = yield select(urlProjectKeySelector);
    yield call(fetch, URLS.projectUpdatePattern(projectKey, pattern.id), {
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
    const projectKey = yield select(urlProjectKeySelector);
    yield call(fetch, URLS.projectUpdatePattern(projectKey, pattern.id), { method: 'delete' });
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

function* updatePAStateWithNotification({ payload: PAEnabled }) {
  yield put(showScreenLockAction());
  try {
    yield call(updatePAState, PAEnabled);
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
  yield takeEvery(UPDATE_PA_STATE, updatePAStateWithNotification);
}

function* fetchProject({ payload: { projectKey, fetchInfoOnly } }) {
  try {
    const project = yield call(fetch, URLS.project(projectKey));
    yield put(fetchProjectSuccessAction(project));
    yield put(setProjectIntegrationsAction(project.integrations));
    if (!fetchInfoOnly) {
      yield put(fetchProjectPreferencesAction(project.projectKey));
    }
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchFetchProject() {
  yield takeEvery(FETCH_PROJECT, fetchProject);
}

function* fetchProjectPreferences({ payload: projectKey }) {
  const userId = yield select(userIdSelector);
  const preferences = yield call(fetch, URLS.projectPreferences(projectKey, userId));
  yield put(fetchProjectPreferencesSuccessAction(preferences));
  yield put(fetchUserFiltersSuccessAction(preferences.filters));
}

function* watchFetchProjectPreferences() {
  yield takeEvery(FETCH_PROJECT_PREFERENCES, fetchProjectPreferences);
}

function* fetchConfigurationAttributes({ payload: projectKey }) {
  const project = yield call(fetch, URLS.project(projectKey));
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
  const activeFilter = yield select(activeFilterSelector);
  if (!activeFilter || filter.id !== activeFilter.id) {
    yield put(addFilterAction(filter));
    yield put(updateProjectFilterPreferencesAction(filter.id, 'PUT'));
  }
}

function* watchShowFilterOnLaunches() {
  yield takeEvery(SHOW_FILTER_ON_LAUNCHES, showFilterOnLaunches);
}

function* updateProjectFilterPreferences({ payload = {} }) {
  const { filterId, method } = payload;
  const projectKey = yield select(projectKeySelector);
  const userId = yield select(userIdSelector);
  yield call(fetch, URLS.projectPreferences(projectKey, userId, filterId), { method });
}

function* watchUpdateProjectFilterPreferences() {
  yield takeEvery(UPDATE_PROJECT_FILTER_PREFERENCES, updateProjectFilterPreferences);
}

export function* projectSagas() {
  yield all([
    watchUpdateDefectType(),
    watchAddDefectType(),
    watchDeleteDefectType(),
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
    watchAddProjectNotification(),
    watchUpdateNotificationState(),
    watchUpdateProjectNotification(),
    watchDeleteProjectNotification(),
    watchFetchProjectNotifications(),
  ]);
}
