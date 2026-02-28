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
import { isEmpty } from 'es-toolkit/compat';

import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { getParentFoldersIds } from 'common/utils/folderUtils';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { MANUAL_LAUNCHES_PAGE, MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import {
  getInitialExpandedFolderIds,
  saveExpandedFolderIds,
  getFolderAndDescendantIds,
} from 'controllers/utils/folderReducerUtils';

import {
  MANUAL_LAUNCHES_NAMESPACE,
  ACTIVE_MANUAL_LAUNCH_NAMESPACE,
  MANUAL_LAUNCH_FOLDERS_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
  TOGGLE_MANUAL_LAUNCH_FOLDER_EXPANSION,
  EXPAND_MANUAL_LAUNCH_FOLDERS_TO_LEVEL,
  SET_MANUAL_LAUNCH_EXPANDED_FOLDER_IDS,
} from './constants';
import {
  ExpandedFolderIdsAction,
  hasFolderExpansionPayload,
  hasSetExpandedFolderIdsPayload,
} from './types';

const expandedFolderIdsReducer = (
  state = getInitialExpandedFolderIds(TMS_INSTANCE_KEY.MANUAL_LAUNCH),
  action: ExpandedFolderIdsAction,
): number[] => {
  switch (action.type) {
    case TOGGLE_MANUAL_LAUNCH_FOLDER_EXPANSION: {
      if (hasFolderExpansionPayload(action)) {
        const { folderId, folders } = action.payload;
        const isExpanded = state.includes(folderId);

        if (isExpanded) {
          const idsToRemove = getFolderAndDescendantIds(folders, folderId);
          const newState = state.filter((id) => !idsToRemove.includes(id));
          saveExpandedFolderIds(TMS_INSTANCE_KEY.MANUAL_LAUNCH, newState);
          return newState;
        }

        const newState = [...state, folderId];

        saveExpandedFolderIds(TMS_INSTANCE_KEY.MANUAL_LAUNCH, newState);

        return newState;
      }

      return state;
    }

    case EXPAND_MANUAL_LAUNCH_FOLDERS_TO_LEVEL: {
      if (hasFolderExpansionPayload(action)) {
        const { folderId, folders } = action.payload;
        const idsToExpand = getParentFoldersIds(folderId, folders).filter(
          (id) => !state.includes(id),
        );

        if (!isEmpty(idsToExpand)) {
          const newState = [...state, ...idsToExpand];
          saveExpandedFolderIds(TMS_INSTANCE_KEY.MANUAL_LAUNCH, newState);
          return newState;
        }
      }

      return state;
    }

    case SET_MANUAL_LAUNCH_EXPANDED_FOLDER_IDS: {
      if (hasSetExpandedFolderIdsPayload(action)) {
        const newState = action.payload.folderIds;

        saveExpandedFolderIds(TMS_INSTANCE_KEY.MANUAL_LAUNCH, newState);

        return newState;
      }

      return state;
    }

    default:
      return state;
  }
};

const reducer = combineReducers({
  data: fetchReducer(MANUAL_LAUNCHES_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(MANUAL_LAUNCHES_NAMESPACE),
  activeManualLaunch: fetchReducer(ACTIVE_MANUAL_LAUNCH_NAMESPACE, { initialState: null }),
  isLoadingActive: loadingReducer(ACTIVE_MANUAL_LAUNCH_NAMESPACE),
});

const foldersReducer = combineReducers({
  data: fetchReducer(MANUAL_LAUNCH_FOLDERS_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(MANUAL_LAUNCH_FOLDERS_NAMESPACE),
  expandedFolderIds: expandedFolderIdsReducer,
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
