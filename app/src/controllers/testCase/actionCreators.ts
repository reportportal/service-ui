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
  CREATE_FOLDER_SUCCESS,
  START_CREATING_FOLDER,
  STOP_CREATING_FOLDER,
  DELETE_FOLDER,
  DELETE_FOLDER_SUCCESS,
  START_LOADING_FOLDER,
  STOP_LOADING_FOLDER,
  GET_TEST_CASES_BY_FOLDER_ID,
  GET_ALL_TEST_CASES,
  START_LOADING_TEST_CASES,
  STOP_LOADING_TEST_CASES,
  SET_TEST_CASES,
  RENAME_FOLDER,
  RENAME_FOLDER_SUCCESS,
  DELETE_TEST_CASE_SUCCESS,
} from './constants';
import { Folder, TransformedFolder } from './types';
import { Page, TestCase } from 'pages/inside/testCaseLibraryPage/types';

export interface GetTestCasesParams {
  search?: string;
  testFolderId?: number;
}

export interface GetTestCasesByFolderIdParams {
  folderId: number;
  offset: number;
  limit: number;
}

export interface GetAllTestCases {
  offset: number;
  limit: number;
}

export interface CreateFolderParams {
  folderName: string;
  parentFolderId?: number;
}

export interface GetFoldersParams {
  projectKey?: string;
}

export interface DeleteFolderParams {
  folder: TransformedFolder;
  activeFolderId: number;
  setAllTestCases: () => void;
}

export interface DeleteTestCaseParams {
  testCase: TestCase;
}

export interface DeleteFolderSuccessParams {
  deletedFolderIds: number[];
}

export interface RenameFolderParams {
  folderId: number;
  folderName: string;
}

export const getTestCasesAction = (params?: GetTestCasesParams) => ({
  type: GET_TEST_CASES,
  payload: params,
});

export const getTestCaseByFolderIdAction = (params: GetTestCasesByFolderIdParams) => ({
  type: GET_TEST_CASES_BY_FOLDER_ID,
  payload: {
    folderId: params.folderId,
    offset: params.offset,
    limit: params.limit,
  },
});

export const getAllTestCasesAction = (params: GetAllTestCases) => ({
  type: GET_ALL_TEST_CASES,
  payload: {
    offset: params.offset,
    limit: params.limit,
  },
});

export const startLoadingTestCasesAction = () => ({
  type: START_LOADING_TEST_CASES,
});

export const stopLoadingTestCasesAction = () => ({
  type: STOP_LOADING_TEST_CASES,
});

export const setTestCasesAction = (testCases: { content: TestCase[]; page: Page | null }) => ({
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

export const createFoldersSuccessAction = (folder: Folder) => ({
  type: CREATE_FOLDER_SUCCESS,
  payload: folder,
});

export const deleteFolderAction = (folderInfo: DeleteFolderParams) => ({
  type: DELETE_FOLDER,
  payload: folderInfo,
});

export const deleteFolderSuccessAction = (deletedFolderIds: DeleteFolderSuccessParams) => ({
  type: DELETE_FOLDER_SUCCESS,
  payload: deletedFolderIds,
});

export const startLoadingFolderAction = () => ({
  type: START_LOADING_FOLDER,
});

export const stopLoadingFolderAction = () => ({
  type: STOP_LOADING_FOLDER,
});

export const deleteTestCaseSuccessAction = ({ testCase }: DeleteTestCaseParams) => ({
  type: DELETE_TEST_CASE_SUCCESS,
  payload: { testCase },
});

export const renameFolderAction = (folderInfo: RenameFolderParams) => ({
  type: RENAME_FOLDER,
  payload: folderInfo,
});

export const renameFolderSuccessAction = (folderId: RenameFolderParams) => ({
  type: RENAME_FOLDER_SUCCESS,
  payload: folderId,
});
