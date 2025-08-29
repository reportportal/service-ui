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
  GET_TEST_CASES,
  GET_FOLDERS,
  CREATE_FOLDER,
  START_CREATING_FOLDER,
  STOP_CREATING_FOLDER,
  GET_TEST_CASES_BY_FOLDER_ID,
  GET_ALL_TEST_CASES,
  START_LOADING_TEST_CASES,
  STOP_LOADING_TEST_CASES,
  SET_TEST_CASES,
} from './constants';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';

export interface GetTestCasesParams {
  search?: string;
  testFolderId?: number;
}

export interface GetTestCasesByFolderIdParams {
  folderId: number;
}

export interface CreateFolderParams {
  folderName: string;
  parentFolderId?: number;
}

export interface GetFoldersParams {
  projectKey?: string;
}

export const getTestCasesAction = (params?: GetTestCasesParams) => ({
  type: GET_TEST_CASES,
  payload: params,
});

export const getTestCaseByFolderIdAction = (params: GetTestCasesByFolderIdParams) => ({
  type: GET_TEST_CASES_BY_FOLDER_ID,
  payload: params.folderId,
});

export const getAllTestCasesAction = () => ({
  type: GET_ALL_TEST_CASES,
});

export const startLoadingTestCasesAction = () => ({
  type: START_LOADING_TEST_CASES,
});

export const stopLoadingTestCasesAction = () => ({
  type: STOP_LOADING_TEST_CASES,
});

export const setTestCasesAction = (testCases: TestCase[]) => ({
  type: SET_TEST_CASES,
  payload: testCases,
});

export const startCreatingFolderAction = () => ({
  type: START_CREATING_FOLDER,
});

export const stopCreatingFolderAction = () => ({
  type: STOP_CREATING_FOLDER,
});

export const getFoldersAction = (params?: GetFoldersParams) => ({
  type: GET_FOLDERS,
  payload: params,
});

export const createFoldersAction = (folder: CreateFolderParams) => ({
  type: CREATE_FOLDER,
  payload: folder,
});
