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
  GET_FILTERED_FOLDERS,
} from './constants';

interface BaseFolder {
  id: number;
  name: string;
  description?: string;
  parentFolderId: number | null;
  index?: number;
}

export interface Folder extends BaseFolder {
  countOfTestCases: number;
  subFolders?: Folder[];
}

export interface TransformedFolder extends BaseFolder {
  testsCount: number;
  folders: TransformedFolder[];
}

export interface FolderWithFullPath {
  id: number;
  description: string;
  name: string;
  fullPath: string;
}

export interface GetAllTestCases {
  offset: number;
  limit: number;
  testCasesSearchParams?: string;
  filterPriorities?: string;
  filterTags?: string;
}

export interface GetTestCasesByFolderIdParams extends GetAllTestCases {
  folderId: number;
}

export interface CreateFolderParams {
  folderName: string;
  parentFolderId?: number;
}

export interface GetFoldersParams {
  projectKey?: string;
  silent?: boolean;
}

export interface DeleteFolderParams {
  folder: TransformedFolder;
  activeFolderId: number;
  setAllTestCases: () => void;
}

export interface RenameFolderParams {
  folderId: number;
  folderName: string;
}

export interface GetFilteredFoldersParams {
  searchQuery?: string;
  extraFilters?: Record<string, string | number>;
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

export interface GetFilteredFoldersAction extends Action<typeof GET_FILTERED_FOLDERS> {
  payload: GetFilteredFoldersParams;
}
