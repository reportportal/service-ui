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

import { Action } from 'redux';
import {
  GET_FOLDERS,
  CREATE_FOLDER,
  DELETE_FOLDER,
  GET_TEST_CASES_BY_FOLDER_ID,
  GET_ALL_TEST_CASES,
  GET_TEST_CASE_DETAILS,
  RENAME_FOLDER,
} from './constants';
import type {
  GetTestCasesByFolderIdParams,
  GetAllTestCases,
  CreateFolderParams,
  DeleteFolderParams,
  RenameFolderParams,
  GetFoldersParams,
} from './actionCreators';

export type Folder = {
  id: number;
  name: string;
  description?: string;
  countOfTestCases: number;
  parentFolderId: number | null;
  index?: number;
  subFolders?: Folder[];
};

export type TransformedFolder = {
  id: number;
  name: string;
  description?: string;
  testsCount: number;
  parentFolderId: number | null;
  index?: number;
  folders: TransformedFolder[];
};

export interface FolderWithFullPath {
  id: number;
  description: string;
  name: string;
  fullPath: string;
}

// Action types for sagas
export interface GetTestCasesByFolderIdAction extends Action<typeof GET_TEST_CASES_BY_FOLDER_ID> {
  payload: GetTestCasesByFolderIdParams;
}

export interface GetAllTestCasesAction extends Action<typeof GET_ALL_TEST_CASES> {
  payload: GetAllTestCases;
}

export interface CreateFolderAction extends Action<typeof CREATE_FOLDER> {
  payload: CreateFolderParams;
}

export interface DeleteFolderAction extends Action<typeof DELETE_FOLDER> {
  payload: DeleteFolderParams;
}

export interface RenameFolderAction extends Action<typeof RENAME_FOLDER> {
  payload: RenameFolderParams;
}

export interface TestCaseDetailsAction extends Action<typeof GET_TEST_CASE_DETAILS> {
  payload: {
    testCaseId: string;
  };
}

export interface GetFoldersAction extends Action<typeof GET_FOLDERS> {
  payload?: GetFoldersParams;
}
