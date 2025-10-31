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

import {
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_DEFECT_TYPE,
  UPDATE_DEFECT_TYPE_SUCCESS,
  ADD_DEFECT_TYPE,
  ADD_DEFECT_TYPE_SUCCESS,
  DELETE_DEFECT_TYPE,
  DELETE_DEFECT_TYPE_SUCCESS,
  ADD_PATTERN,
  ADD_PATTERN_SUCCESS,
  UPDATE_PATTERN,
  UPDATE_PATTERN_SUCCESS,
  DELETE_PATTERN,
  DELETE_PATTERN_SUCCESS,
  UPDATE_PA_STATE,
  FETCH_PROJECT,
  FETCH_PROJECT_PREFERENCES,
  FETCH_CONFIGURATION_ATTRIBUTES,
  SHOW_FILTER_ON_LAUNCHES,
  HIDE_FILTER_ON_LAUNCHES,
  UPDATE_PROJECT_FILTER_PREFERENCES,
  ADD_PROJECT_NOTIFICATION,
  ADD_PROJECT_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_STATE,
  UPDATE_PROJECT_NOTIFICATION,
  DELETE_PROJECT_NOTIFICATION,
  FETCH_PROJECT_NOTIFICATIONS,
  FETCH_PROJECT_NOTIFICATIONS_SUCCESS,
  DELETE_PROJECT_NOTIFICATION_SUCCESS,
  UPDATE_PROJECT_NOTIFICATION_SUCCESS,
  SET_PROJECT_NOTIFICATION_LOADING,
  FETCH_EXISTING_LAUNCH_NAMES_SUCCESS,
  FETCH_LOG_TYPES,
  CREATE_LOG_TYPE,
} from './constants';

export const fetchProjectSuccessAction = (project) => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: project,
});

export const fetchProjectPreferencesSuccessAction = (preferences) => ({
  type: FETCH_PROJECT_PREFERENCES_SUCCESS,
  payload: preferences,
});

export const updateConfigurationAttributesAction = (project) => ({
  type: UPDATE_CONFIGURATION_ATTRIBUTES,
  payload: project.configuration.attributes,
});

export const updateProjectFilterPreferencesAction = (filterId, method) => ({
  type: UPDATE_PROJECT_FILTER_PREFERENCES,
  payload: { filterId, method },
});

export const showFilterOnLaunchesAction = (filter) => ({
  type: SHOW_FILTER_ON_LAUNCHES,
  payload: filter,
});

export const hideFilterOnLaunchesAction = (filter) => ({
  type: HIDE_FILTER_ON_LAUNCHES,
  payload: filter,
});

export const fetchProjectPreferencesAction = (projectId) => ({
  type: FETCH_PROJECT_PREFERENCES,
  payload: projectId,
});

export const fetchProjectAction = (projectId, fetchInfoOnly) => ({
  type: FETCH_PROJECT,
  payload: { projectId, fetchInfoOnly },
});

export const fetchConfigurationAttributesAction = (projectId) => ({
  type: FETCH_CONFIGURATION_ATTRIBUTES,
  payload: projectId,
});

export const updateDefectTypeAction = (defectType) => ({
  type: UPDATE_DEFECT_TYPE,
  payload: defectType,
});

export const updateDefectTypeSuccessAction = (defectType) => ({
  type: UPDATE_DEFECT_TYPE_SUCCESS,
  payload: defectType,
});

export const addDefectTypeAction = (defectType) => ({
  type: ADD_DEFECT_TYPE,
  payload: defectType,
});

export const addDefectTypeSuccessAction = (defectType) => ({
  type: ADD_DEFECT_TYPE_SUCCESS,
  payload: defectType,
});

export const deleteDefectTypeAction = (defectType) => ({
  type: DELETE_DEFECT_TYPE,
  payload: defectType,
});

export const deleteDefectTypeSuccessAction = (defectType) => ({
  type: DELETE_DEFECT_TYPE_SUCCESS,
  payload: defectType,
});

export const addPatternAction = (pattern) => ({
  type: ADD_PATTERN,
  payload: pattern,
});

export const addPatternSuccessAction = (pattern) => ({
  type: ADD_PATTERN_SUCCESS,
  payload: pattern,
});

export const updatePatternAction = (pattern) => ({
  type: UPDATE_PATTERN,
  payload: pattern,
});

export const updatePatternSuccessAction = (pattern) => ({
  type: UPDATE_PATTERN_SUCCESS,
  payload: pattern,
});

export const deletePatternAction = (pattern) => ({
  type: DELETE_PATTERN,
  payload: pattern,
});

export const deletePatternSuccessAction = (pattern) => ({
  type: DELETE_PATTERN_SUCCESS,
  payload: pattern,
});

export const updatePAStateAction = (PAState) => ({
  type: UPDATE_PA_STATE,
  payload: PAState,
});

export const fetchProjectNotificationsAction = () => ({
  type: FETCH_PROJECT_NOTIFICATIONS,
});

export const fetchProjectNotificationsSuccessAction = (notifications) => ({
  type: FETCH_PROJECT_NOTIFICATIONS_SUCCESS,
  payload: notifications,
});

export const addProjectNotificationAction = (notification, triggerAddingEvent = () => {}) => ({
  type: ADD_PROJECT_NOTIFICATION,
  payload: { notification, triggerAddingEvent },
});

export const addProjectNotificationSuccessAction = (notification) => ({
  type: ADD_PROJECT_NOTIFICATION_SUCCESS,
  payload: notification,
});

export const updateNotificationStateAction = (notificationState, pluginName) => ({
  type: UPDATE_NOTIFICATION_STATE,
  payload: { notificationState, pluginName },
});

export const updateProjectNotificationAction = (notification) => ({
  type: UPDATE_PROJECT_NOTIFICATION,
  payload: notification,
});

export const updateProjectNotificationSuccessAction = (notification) => ({
  type: UPDATE_PROJECT_NOTIFICATION_SUCCESS,
  payload: notification,
});

export const deleteProjectNotificationAction = (id) => ({
  type: DELETE_PROJECT_NOTIFICATION,
  payload: id,
});

export const deleteProjectNotificationSuccessAction = (id) => ({
  type: DELETE_PROJECT_NOTIFICATION_SUCCESS,
  payload: id,
});

export const setProjectNotificationsLoadingAction = (loading) => ({
  type: SET_PROJECT_NOTIFICATION_LOADING,
  payload: loading,
});

export const fetchExistingLaunchNamesSuccessAction = (payload) => ({
  type: FETCH_EXISTING_LAUNCH_NAMES_SUCCESS,
  payload,
});

export const fetchLogTypesAction = (projectId) => ({
  type: FETCH_LOG_TYPES,
  payload: projectId,
});

export const createLogTypeAction = (data, projectId, onSuccess) => ({
  type: CREATE_LOG_TYPE,
  payload: { data, projectId, onSuccess },
});
