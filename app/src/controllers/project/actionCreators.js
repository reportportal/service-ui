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
  UPDATE_NOTIFICATIONS_CONFIG,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  UPDATE_DEFECT_SUBTYPE,
  UPDATE_DEFECT_SUBTYPE_SUCCESS,
  ADD_DEFECT_SUBTYPE,
  ADD_DEFECT_SUBTYPE_SUCCESS,
  DELETE_DEFECT_SUBTYPE,
  DELETE_DEFECT_SUBTYPE_SUCCESS,
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

export const updateProjectNotificationsConfigAction = (config) => ({
  type: UPDATE_NOTIFICATIONS_CONFIG,
  payload: config,
});

export const updateProjectNotificationsConfigSuccessAction = (config) => ({
  type: UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  payload: config,
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

export const fetchProjectPreferencesAction = (projectKey) => ({
  type: FETCH_PROJECT_PREFERENCES,
  payload: projectKey,
});

export const fetchProjectAction = (projectKey, fetchInfoOnly) => ({
  type: FETCH_PROJECT,
  payload: { fetchInfoOnly, projectKey },
});

export const fetchConfigurationAttributesAction = (projectKey) => ({
  type: FETCH_CONFIGURATION_ATTRIBUTES,
  payload: projectKey,
});

export const updateDefectSubTypeAction = (subType) => ({
  type: UPDATE_DEFECT_SUBTYPE,
  payload: subType,
});

export const updateDefectSubTypeSuccessAction = (subType) => ({
  type: UPDATE_DEFECT_SUBTYPE_SUCCESS,
  payload: subType,
});

export const addDefectSubTypeAction = (subType) => ({
  type: ADD_DEFECT_SUBTYPE,
  payload: subType,
});

export const addDefectSubTypeSuccessAction = (subType) => ({
  type: ADD_DEFECT_SUBTYPE_SUCCESS,
  payload: subType,
});

export const deleteDefectSubTypeAction = (subType) => ({
  type: DELETE_DEFECT_SUBTYPE,
  payload: subType,
});

export const deleteDefectSubTypeSuccessAction = (subType) => ({
  type: DELETE_DEFECT_SUBTYPE_SUCCESS,
  payload: subType,
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

export const addProjectNotificationAction = (notification) => ({
  type: ADD_PROJECT_NOTIFICATION,
  payload: notification,
});

export const addProjectNotificationSuccessAction = (notification) => ({
  type: ADD_PROJECT_NOTIFICATION_SUCCESS,
  payload: notification,
});

export const updateNotificationStateAction = (notificationState) => ({
  type: UPDATE_NOTIFICATION_STATE,
  payload: notificationState,
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
