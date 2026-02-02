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

import { combineReducers } from 'redux';

import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { MANUAL_LAUNCHES_PAGE, MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';

import {
  MANUAL_LAUNCHES_NAMESPACE,
  ACTIVE_MANUAL_LAUNCH_NAMESPACE,
  MANUAL_LAUNCH_FOLDERS_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
} from './constants';

const reducer = combineReducers({
  data: fetchReducer(MANUAL_LAUNCHES_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(MANUAL_LAUNCHES_NAMESPACE),
  activeManualLaunch: fetchReducer(ACTIVE_MANUAL_LAUNCH_NAMESPACE, { initialState: null }),
  isLoadingActive: loadingReducer(ACTIVE_MANUAL_LAUNCH_NAMESPACE),
});

const foldersReducer = combineReducers({
  data: fetchReducer(MANUAL_LAUNCH_FOLDERS_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(MANUAL_LAUNCH_FOLDERS_NAMESPACE),
});

const executionsReducer = combineReducers({
  data: fetchReducer(MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE, {
    initialState: null,
    contentPath: 'data',
  }),
  isLoading: loadingReducer(MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE),
});

export const manualLaunchesReducer = createPageScopedReducer(reducer, [
  MANUAL_LAUNCHES_PAGE,
  MANUAL_LAUNCH_DETAILS_PAGE,
]);

export const manualLaunchFoldersReducer = createPageScopedReducer(foldersReducer, [
  MANUAL_LAUNCH_DETAILS_PAGE,
]);

export const manualLaunchTestCaseExecutionsReducer = createPageScopedReducer(executionsReducer, [
  MANUAL_LAUNCH_DETAILS_PAGE,
]);
