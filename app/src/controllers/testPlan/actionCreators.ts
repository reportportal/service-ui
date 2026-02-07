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

import { Folder } from 'controllers/testCase';

import {
  GET_TEST_PLANS,
  GET_TEST_PLAN,
  TOGGLE_TEST_PLAN_FOLDER_EXPANSION,
  EXPAND_TEST_PLAN_FOLDERS_TO_LEVEL,
  SET_TEST_PLAN_EXPANDED_FOLDER_IDS,
  DELETE_TEST_PLAN_FOLDER_SUCCESS,
} from './constants';

export interface GetTestPlansParams {
  offset?: string | number;
  limit?: string | number;
}

export interface GetTestPlanParams {
  testPlanId: string | number;
  folderId?: string | number;
  offset?: string | number;
  limit?: string | number;
}

export const getTestPlansAction = (params?: GetTestPlansParams) => ({
  type: GET_TEST_PLANS,
  payload: params,
});

export const getTestPlanAction = (params: GetTestPlanParams) => ({
  type: GET_TEST_PLAN,
  payload: params,
});

export interface ToggleTestPlanFolderExpansionParams {
  folderId: number;
  folders: Folder[];
}

export interface SetTestPlanExpandedFolderIdsParams {
  folderIds: number[];
}

export interface DeleteTestPlanFolderSuccessParams {
  deletedFolderIds: number[];
}

export const toggleTestPlanFolderExpansionAction = (
  params: ToggleTestPlanFolderExpansionParams,
) => ({
  type: TOGGLE_TEST_PLAN_FOLDER_EXPANSION,
  payload: params,
});

export const expandTestPlanFoldersToLevelAction = (
  params: ToggleTestPlanFolderExpansionParams,
) => ({
  type: EXPAND_TEST_PLAN_FOLDERS_TO_LEVEL,
  payload: params,
});

export const setTestPlanExpandedFolderIdsAction = (
  params: SetTestPlanExpandedFolderIdsParams,
) => ({
  type: SET_TEST_PLAN_EXPANDED_FOLDER_IDS,
  payload: params,
});

export const deleteTestPlanFolderSuccessAction = (
  params: DeleteTestPlanFolderSuccessParams,
) => ({
  type: DELETE_TEST_PLAN_FOLDER_SUCCESS,
  payload: params,
});
