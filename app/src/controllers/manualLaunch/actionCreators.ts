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
  GET_MANUAL_LAUNCHES,
  GET_MANUAL_LAUNCH,
  GET_MANUAL_LAUNCH_FOLDERS,
  GET_MANUAL_LAUNCH_TEST_CASE_EXECUTIONS,
} from './constants';
import {
  GetManualLaunchesParams,
  GetManualLaunchParams,
  GetManualLaunchFoldersParams,
  GetManualLaunchTestCaseExecutionsParams,
} from './types';

export const getManualLaunchesAction = (params?: GetManualLaunchesParams) => ({
  type: GET_MANUAL_LAUNCHES,
  payload: params,
});

export const getManualLaunchAction = (params: GetManualLaunchParams) => ({
  type: GET_MANUAL_LAUNCH,
  payload: params,
});

export const getManualLaunchFoldersAction = (params: GetManualLaunchFoldersParams) => ({
  type: GET_MANUAL_LAUNCH_FOLDERS,
  payload: params,
});

export const getManualLaunchTestCaseExecutionsAction = (
  params: GetManualLaunchTestCaseExecutionsParams,
) => ({
  type: GET_MANUAL_LAUNCH_TEST_CASE_EXECUTIONS,
  payload: params,
});
