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
import { Page } from 'types/common';
import { AppState } from 'types/store';

import {
  ManualLaunchState,
  ManualLaunchFoldersState,
  ManualLaunchTestCaseExecutionsState,
  ManualLaunchFolder,
  TestCaseExecution,
} from './types';

export const manualLaunchesSelector = (state: AppState): ManualLaunchState =>
  state.manualLaunch || { data: { content: null, page: null } };

export const isLoadingSelector = (state: AppState) =>
  Boolean(manualLaunchesSelector(state).isLoading);

export const manualLaunchContentSelector = (state: AppState) =>
  manualLaunchesSelector(state).data?.content;

export const manualLaunchPageSelector = (state: AppState) =>
  manualLaunchesSelector(state).data?.page;

export const activeManualLaunchSelector = (state: AppState) =>
  manualLaunchesSelector(state).activeManualLaunch || null;

export const isLoadingActiveSelector = (state: AppState) =>
  Boolean(manualLaunchesSelector(state).isLoadingActive);

export const manualLaunchByIdSelector = (launchId: string | number) => (state: AppState) => {
  const activeManualLaunch = activeManualLaunchSelector(state);

  if (activeManualLaunch?.id === Number(launchId)) {
    return activeManualLaunch;
  }

  const launches = manualLaunchContentSelector(state);

  if (launches) {
    return launches.find((launch) => launch.id === Number(launchId));
  }

  return undefined;
};

// Selectors for Manual Launch Folders
const manualLaunchFoldersStateSelector = (state: AppState): ManualLaunchFoldersState | undefined =>
  state.manualLaunchFolders || { data: { content: [], page: null } };

export const manualLaunchFoldersSelector = (state: AppState): ManualLaunchFolder[] =>
  manualLaunchFoldersStateSelector(state)?.data?.content || [];

export const manualLaunchFoldersPageSelector = (state: AppState): Page | null =>
  manualLaunchFoldersStateSelector(state)?.data?.page || null;

export const isLoadingManualLaunchFoldersSelector = (state: AppState): boolean =>
  Boolean(manualLaunchFoldersStateSelector(state)?.isLoading);

// Selectors for Test Case Executions
const manualLaunchTestCaseExecutionsStateSelector = (
  state: AppState,
): ManualLaunchTestCaseExecutionsState | undefined => state.manualLaunchTestCaseExecutions;

export const manualLaunchTestCaseExecutionsSelector = (state: AppState): TestCaseExecution[] =>
  manualLaunchTestCaseExecutionsStateSelector(state)?.data?.content || [];

export const manualLaunchTestCaseExecutionsPageSelector = (state: AppState): Page | null =>
  manualLaunchTestCaseExecutionsStateSelector(state)?.data?.page || null;

export const isLoadingManualLaunchTestCaseExecutionsSelector = (state: AppState): boolean =>
  Boolean(manualLaunchTestCaseExecutionsStateSelector(state)?.isLoading);
