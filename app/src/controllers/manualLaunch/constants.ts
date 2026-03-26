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

export const GET_MANUAL_LAUNCHES = 'getManualLaunches' as const;
export const GET_MANUAL_LAUNCH = 'getManualLaunch' as const;
export const GET_MANUAL_LAUNCH_FOLDERS = 'getManualLaunchFolders' as const;
export const GET_MANUAL_LAUNCH_TEST_CASE_EXECUTIONS = 'getManualLaunchTestCaseExecutions' as const;
export const GET_MANUAL_LAUNCH_EXECUTION = 'getManualLaunchExecution' as const;
export const UPDATE_MANUAL_LAUNCH_EXECUTION_STATUS = 'updateManualLaunchExecutionStatus' as const;
export const TOGGLE_MANUAL_LAUNCH_FOLDER_EXPANSION = 'toggleManualLaunchFolderExpansion' as const;
export const EXPAND_MANUAL_LAUNCH_FOLDERS_TO_LEVEL = 'expandManualLaunchFoldersToLevel' as const;
export const SET_MANUAL_LAUNCH_EXPANDED_FOLDER_IDS = 'setManualLaunchExpandedFolderIds' as const;
export const MANUAL_LAUNCHES_NAMESPACE = 'manualLaunches' as const;
export const ACTIVE_MANUAL_LAUNCH_NAMESPACE = 'activeManualLaunch' as const;
export const MANUAL_LAUNCH_FOLDERS_NAMESPACE = 'manualLaunchFolders' as const;
export const MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE =
  'manualLaunchTestCaseExecutions' as const;
export const ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE = 'activeManualLaunchExecution' as const;

export const MANUAL_SCENARIO_TYPE_TEXT = 'TEXT' as const;
export const MANUAL_SCENARIO_TYPE_STEPS = 'STEPS' as const;

export const TEST_FOLDER_ID_FILTER_KEY = 'filter.eq.testFolderId' as const;

export const MANUAL_LAUNCH_NAME_FILTER_KEY = 'filter.cnt.name' as const;
export const MANUAL_LAUNCH_STATUS_FILTER_KEY = 'filter.eq.status' as const;
export const MANUAL_LAUNCH_FOLDER_SEARCH_FILTER_KEY = 'filter.cnt.testCaseName' as const;

export const GET_MANUAL_LAUNCH_FILTERED_FOLDERS = 'getManualLaunchFilteredFolders' as const;
export const SET_MANUAL_LAUNCH_FILTERED_FOLDERS = 'setManualLaunchFilteredFolders' as const;
export const START_LOADING_MANUAL_LAUNCH_FILTERED_FOLDERS =
  'startLoadingManualLaunchFilteredFolders' as const;
export const STOP_LOADING_MANUAL_LAUNCH_FILTERED_FOLDERS =
  'stopLoadingManualLaunchFilteredFolders' as const;
export const CLEAR_MANUAL_LAUNCH_FILTERED_FOLDERS = 'clearManualLaunchFilteredFolders' as const;

export const defaultManualLaunchesQueryParams = {
  limit: 20,
  offset: 0,
};
