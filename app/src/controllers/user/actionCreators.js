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
  // SET_ACTIVE_PROJECT,
  SET_START_TIME_FORMAT,
  SET_API_KEYS,
  SET_PHOTO_TIME_STAMP,
  ASSIGN_TO_PROJECT,
  ASSIGN_TO_PROJECT_SUCCESS,
  ASSIGN_TO_PROJECT_ERROR,
  UNASSIGN_FROM_PROJECT,
  UNASSIGN_FROM_PROJECT_SUCCESS,
  FETCH_API_KEYS,
  ADD_API_KEY,
  DELETE_API_KEY,
  FETCH_USER_SUCCESS,
  FETCH_USER,
  FETCH_USER_ERROR,
  DELETE_API_KEY_SUCCESS,
  ADD_API_KEY_SUCCESS,
  DELETE_USER_ACCOUNT,
  SET_LAST_PROJECT,
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

export const setLastProjectAction = (lastProject) => ({
  type: SET_LAST_PROJECT,
  payload: lastProject,
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

export const deleteUserAccountAction = (onSuccess) => ({
  type: DELETE_USER_ACCOUNT,
  payload: { onSuccess },
});

export const deleteApiKeySuccessAction = (apiKeyId) => ({
  type: DELETE_API_KEY_SUCCESS,
  payload: apiKeyId,
});

export const fetchApiKeysAction = () => ({ type: FETCH_API_KEYS });

export const fetchUserAction = () => ({ type: FETCH_USER });

export const setStartTimeFormatAction = (format) => ({
  type: SET_START_TIME_FORMAT,
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

export const unassignFromProjectAction = (project) => ({
  type: UNASSIGN_FROM_PROJECT,
  payload: project,
});

export const unassignFromProjectSuccessAction = (project) => ({
  type: UNASSIGN_FROM_PROJECT_SUCCESS,
  payload: project,
});
