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

export const FETCH_USER = 'FETCH_USER';
export const FETCH_USER_ERROR = 'fetchUserError';
export const FETCH_USER_SUCCESS = 'fetchUserSuccess';
export const SET_ACTIVE_PROJECT = 'setActiveProject';
export const SET_START_TIME_FORMAT = 'setStartTimeFormat';
export const SET_PHOTO_TIME_STAMP = 'setPhotoTimeStamp';

export const START_TIME_FORMAT_RELATIVE = 'relative';
export const START_TIME_FORMAT_ABSOLUTE = 'absolute';

export const SETTINGS_INITIAL_STATE = {
  startTimeFormat: START_TIME_FORMAT_RELATIVE,
  photoTimeStamp: Date.now(),
};

export const ASSIGN_TO_PROJECT = 'assignToProject';
export const ASSIGN_TO_PROJECT_SUCCESS = 'assignToProjectSuccess';
export const ASSIGN_TO_PROJECT_ERROR = 'assignToProjectError';
export const UNASSIGN_FROM_PROJECT = 'unassignFromProject';
export const UNASSIGN_FROM_PROJECT_SUCCESS = 'unassignFromProjectSuccess';

export const FETCH_API_KEYS = 'fetchApiKeys';
export const SET_API_KEYS = 'setApiKeys';
export const ADD_API_KEY = 'addApiKey';
export const ADD_API_KEY_SUCCESS = 'addApiKeySuccess';
export const DELETE_API_KEY = 'deleteApiKey';
export const DELETE_API_KEY_SUCCESS = 'deleteApiKeySuccess';
export const DELETE_USER_ACCOUNT = 'deleteUserAccount';
