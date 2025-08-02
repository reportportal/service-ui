/*
 * Copyright 2025 EPAM Systems
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
  GET_FOLDERS,
  CREATE_FOLDER,
  UPDATE_FOLDERS,
  START_CREATING_FOLDER,
  STOP_CREATING_FOLDER,
} from './constants';

export const startCreatingFolderAction = () => ({
  type: START_CREATING_FOLDER,
});

export const stopCreatingFolderAction = () => ({
  type: STOP_CREATING_FOLDER,
});

export const getFoldersAction = () => ({
  type: GET_FOLDERS,
});

export const createFoldersAction = (folder) => ({
  type: CREATE_FOLDER,
  payload: folder,
});

export const updateFoldersAction = (folders) => ({
  type: UPDATE_FOLDERS,
  payload: folders,
});
