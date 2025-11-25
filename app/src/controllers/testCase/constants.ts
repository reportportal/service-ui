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

export const GET_FOLDERS = 'getFolders' as const;
export const CREATE_FOLDER = 'createFolder' as const;
export const CREATE_FOLDER_SUCCESS = 'createFolderSuccess' as const;
export const CREATE_FOLDERS_BATCH_SUCCESS = 'createFoldersBatchSuccess' as const;
export const DELETE_FOLDER = 'deleteFolder' as const;
export const DELETE_FOLDER_SUCCESS = 'deleteFolderSuccess' as const;
export const SELECT_ACTIVE_FOLDER = 'selectActiveFolder' as const;
export const START_CREATING_FOLDER = 'startCreatingFolder' as const;
export const STOP_CREATING_FOLDER = 'stopCreatingFolder' as const;
export const START_LOADING_FOLDER = 'startLoadingFolder' as const;
export const STOP_LOADING_FOLDER = 'stopLoadingFolder' as const;
export const NAMESPACE = 'testCase' as const;
export const GET_TEST_CASES_BY_FOLDER_ID = 'getTestCasesByFolderId' as const;
export const GET_ALL_TEST_CASES = 'getAllTestCases' as const;
export const START_LOADING_TEST_CASES = 'startLoadingTestCases' as const;
export const STOP_LOADING_TEST_CASES = 'stopLoadingTestCases' as const;
export const SET_TEST_CASES = 'setTestCases' as const;
export const DELETE_TEST_CASE_SUCCESS = 'deleteTestCaseSuccess' as const;
export const GET_TEST_CASE_DETAILS = 'getTestCaseDetails' as const;
export const GET_TEST_CASE_DETAILS_SUCCESS = 'getTestCaseDetailsSuccess' as const;
export const GET_TEST_CASE_DETAILS_FAILURE = 'getTestCaseDetailsFailure' as const;
export const RENAME_FOLDER = 'renameFolder' as const;
export const RENAME_FOLDER_SUCCESS = 'renameFolderSuccess' as const;
export const UPDATE_FOLDER_COUNTER = 'updateFolderCounter' as const;
export const UPDATE_DESCRIPTION_SUCCESS = 'updateDescriptionSuccess' as const;
