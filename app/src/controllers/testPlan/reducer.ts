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
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { PROJECT_TEST_PLANS_PAGE, PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { getStorageItem } from 'common/utils/storageUtils';
import { getFolderAndDescendantIds } from 'controllers/utils/folderReducerUtils';
import { hasPayloadProps } from 'controllers/utils/types';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';

import {
  ACTIVE_TEST_PLAN_NAMESPACE,
  TEST_PLAN_FOLDERS_NAMESPACE,
  TEST_PLANS_NAMESPACE,
  TEST_PLAN_TEST_CASES_NAMESPACE,
  TOGGLE_TEST_PLAN_FOLDER_EXPANSION,
  EXPAND_TEST_PLAN_FOLDERS_TO_LEVEL,
  SET_TEST_PLAN_EXPANDED_FOLDER_IDS,
  DELETE_TEST_PLAN_FOLDER_SUCCESS,
  SET_TEST_PLAN_INITIAL_EXPANDED_FOLDERS,
} from './constants';
import {
  ToggleTestPlanFolderExpansionParams,
  SetTestPlanExpandedFolderIdsParams,
  DeleteTestPlanFolderSuccessParams,
  SetTestPlanInitialExpandedFoldersParams,
} from './actionCreators';

const hasTestPlanFolderExpansionPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: ToggleTestPlanFolderExpansionParams } =>
  hasPayloadProps<ToggleTestPlanFolderExpansionParams>(action, ['folderId', 'folders']);

const hasTestPlanDeleteFolderPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: DeleteTestPlanFolderSuccessParams } =>
  hasPayloadProps<DeleteTestPlanFolderSuccessParams>(action, ['deletedFolderIds']);

const hasTestPlanSetExpandedFolderIdsPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: SetTestPlanExpandedFolderIdsParams } =>
  hasPayloadProps<SetTestPlanExpandedFolderIdsParams>(action, ['folderIds']);

const hasSetTestPlanInitialExpandedFoldersPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: SetTestPlanInitialExpandedFoldersParams } =>
  hasPayloadProps<SetTestPlanInitialExpandedFoldersParams>(action, ['testPlanId']);

const INITIAL_EXPANDED_FOLDER_IDS: number[] = [];

const testPlanExpandedFolderIdsReducer = (
  state = INITIAL_EXPANDED_FOLDER_IDS,
  action:
    | {
      type: typeof TOGGLE_TEST_PLAN_FOLDER_EXPANSION;
      payload: ToggleTestPlanFolderExpansionParams;
    }
    | {
      type: typeof EXPAND_TEST_PLAN_FOLDERS_TO_LEVEL;
      payload: ToggleTestPlanFolderExpansionParams;
    }
    | {
      type: typeof SET_TEST_PLAN_EXPANDED_FOLDER_IDS;
      payload: SetTestPlanExpandedFolderIdsParams;
    }
    | { type: typeof DELETE_TEST_PLAN_FOLDER_SUCCESS; payload: DeleteTestPlanFolderSuccessParams }
    | {
      type: typeof SET_TEST_PLAN_INITIAL_EXPANDED_FOLDERS;
      payload: SetTestPlanInitialExpandedFoldersParams;
    }
    | { type: string },
) => {
  switch (action.type) {
    case TOGGLE_TEST_PLAN_FOLDER_EXPANSION: {
      if (hasTestPlanFolderExpansionPayload(action)) {
        const { folderId, folders } = action.payload;
        const isExpanded = state.includes(folderId);

        if (isExpanded) {
          const idsToRemove = getFolderAndDescendantIds(folders, folderId);

          return state.filter((id) => !idsToRemove.includes(id));
        }

        return [...state, folderId];
      }

      return state;
    }
    case EXPAND_TEST_PLAN_FOLDERS_TO_LEVEL: {
      if (hasTestPlanFolderExpansionPayload(action)) {
        const { folderId, folders } = action.payload;
        const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
        const idsToExpand: number[] = [];
        const targetFolder = folderMap.get(folderId);

        let currentCursor = targetFolder?.parentFolderId;

        while (currentCursor) {
          const parentFolder = folderMap.get(currentCursor);

          if (!parentFolder) {
            break;
          }

          if (!state.includes(currentCursor)) {
            idsToExpand.push(currentCursor);
          }

          currentCursor = parentFolder.parentFolderId;
        }

        return !isEmpty(idsToExpand) ? [...state, ...idsToExpand] : state;
      }

      return state;
    }
    case SET_TEST_PLAN_EXPANDED_FOLDER_IDS: {
      if (hasTestPlanSetExpandedFolderIdsPayload(action)) {
        return action.payload.folderIds;
      }

      return state;
    }
    case DELETE_TEST_PLAN_FOLDER_SUCCESS: {
      if (hasTestPlanDeleteFolderPayload(action)) {
        const { deletedFolderIds } = action.payload;

        return state.filter((id) => !deletedFolderIds.includes(id));
      }

      return state;
    }
    case SET_TEST_PLAN_INITIAL_EXPANDED_FOLDERS: {
      if (hasSetTestPlanInitialExpandedFoldersPayload(action)) {
        const { testPlanId } = action.payload;
        const storageKey = getExpandedFoldersStorageKey(TMS_INSTANCE_KEY.TEST_PLAN);
        const record = (getStorageItem(storageKey) as Record<string, number[]>) || {};

        return Array.isArray(record[testPlanId]) ? record[testPlanId] : [];
      }

      return state;
    }
    default:
      return state;
  }
};

const reducer = combineReducers({
  data: fetchReducer(TEST_PLANS_NAMESPACE, { initialState: null, contentPath: 'data' }),
  isLoading: loadingReducer(TEST_PLANS_NAMESPACE),
  activeTestPlan: fetchReducer(ACTIVE_TEST_PLAN_NAMESPACE, { initialState: null }),
  testPlanFolders: fetchReducer(TEST_PLAN_FOLDERS_NAMESPACE, { initialState: null }),
  testPlanTestCases: fetchReducer(TEST_PLAN_TEST_CASES_NAMESPACE, { initialState: null }),
  isLoadingActive: loadingReducer(ACTIVE_TEST_PLAN_NAMESPACE),
  isLoadingTestPlanTestCases: loadingReducer(TEST_PLAN_TEST_CASES_NAMESPACE),
  expandedFolderIds: testPlanExpandedFolderIdsReducer,
});

export const testPlanReducer = createPageScopedReducer(reducer, [
  PROJECT_TEST_PLANS_PAGE,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
]);
