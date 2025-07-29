/*
 * Copyright 2024 EPAM Systems
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
  SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SET_API_KEYS,
  SET_PHOTO_TIME_STAMP,
  ASSIGN_TO_PROJECT,
  ASSIGN_TO_PROJECT_SUCCESS,
  ASSIGN_TO_PROJECT_ERROR,
  FETCH_API_KEYS,
  ADD_API_KEY,
  DELETE_API_KEY,
  FETCH_USER_SUCCESS,
  FETCH_USER,
  FETCH_USER_INFO,
  FETCH_USER_ERROR,
  DELETE_API_KEY_SUCCESS,
  ADD_API_KEY_SUCCESS,
  DELETE_USER_ACCOUNT,
  SET_ACTIVE_PROJECT_KEY,
  SET_LOG_TIME_FORMAT,
  UPDATE_USER_INFO,
} from './constants';

export const fetchUserSuccessAction = (user) => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const fetchUserErrorAction = () => ({
  type: FETCH_USER_ERROR,
  error: true,
});

export const setPhotoTimeStampAction = (timeStamp) => ({
  type: SET_PHOTO_TIME_STAMP,
  payload: timeStamp,
});

export const setApiKeysAction = (apiKeys = []) => ({
  type: SET_API_KEYS,
  payload: apiKeys,
});

export const setActiveProjectAction = (activeProject) => ({
  type: SET_ACTIVE_PROJECT,
  payload: activeProject,
});

export const setActiveProjectKeyAction = (activeProjectKey) => ({
  type: SET_ACTIVE_PROJECT_KEY,
  payload: activeProjectKey,
});

export const addApiKeyAction = (name, successMessage, errorMessage, onSuccess) => ({
  type: ADD_API_KEY,
  payload: { name, successMessage, errorMessage, onSuccess },
});

export const addApiKeySuccessAction = (apiKey) => ({
  type: ADD_API_KEY_SUCCESS,
  payload: apiKey,
});

export const deleteApiKeyAction = (apiKeyId, successMessage, errorMessage, onSuccess) => ({
  type: DELETE_API_KEY,
  payload: { apiKeyId, successMessage, errorMessage, onSuccess },
});

export const deleteUserAccountAction = (onSuccess, userId) => ({
  type: DELETE_USER_ACCOUNT,
  payload: { onSuccess, userId },
});

export const deleteApiKeySuccessAction = (apiKeyId) => ({
  type: DELETE_API_KEY_SUCCESS,
  payload: apiKeyId,
});

export const fetchApiKeysAction = () => ({ type: FETCH_API_KEYS });

export const fetchUserAction = () => ({
  type: FETCH_USER,
});

export const fetchUserInfoAction = () => ({
  type: FETCH_USER_INFO,
});

export const setStartTimeFormatAction = (format) => ({
  type: SET_START_TIME_FORMAT,
  payload: format,
});
export const setLogTimeFormatAction = (format) => ({
  type: SET_LOG_TIME_FORMAT,
  payload: format,
});

export const assignToProjectAction = (project) => ({
  type: ASSIGN_TO_PROJECT,
  payload: project,
});

export const assignToProjectSuccessAction = (projectInfo) => ({
  type: ASSIGN_TO_PROJECT_SUCCESS,
  payload: projectInfo,
});

export const assignToProjectErrorAction = (projectInfo) => ({
  type: ASSIGN_TO_PROJECT_ERROR,
  payload: projectInfo,
});

export const updateUserInfoAction = (email, data, onSuccess) => ({
  type: UPDATE_USER_INFO,
  payload: { email, data, onSuccess },
});
