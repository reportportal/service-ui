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
import { isEmpty, isNil } from 'es-toolkit/compat';

import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { getInitialExpandedFolderIds } from 'controllers/utils/folderReducerUtils';
import { hasPayloadProps } from 'controllers/utils/types';
import {
  CREATE_FOLDER_SUCCESS,
  CREATE_FOLDERS_BATCH_SUCCESS,
  DELETE_FOLDER_SUCCESS,
  DELETE_TEST_CASE_SUCCESS,
  EXPAND_FOLDERS_TO_LEVEL,
  GET_TEST_CASE_DETAILS,
  GET_TEST_CASE_DETAILS_FAILURE,
  GET_TEST_CASE_DETAILS_SUCCESS,
  MOVE_FOLDER_SUCCESS,
  NAMESPACE,
  RENAME_FOLDER_SUCCESS,
  SET_EXPANDED_FOLDER_IDS,
  SET_FOLDERS_FETCHED,
  SET_TEST_CASES,
  START_CREATING_FOLDER,
  START_LOADING_FOLDER,
  START_LOADING_TEST_CASES,
  STOP_CREATING_FOLDER,
  STOP_LOADING_FOLDER,
  STOP_LOADING_TEST_CASES,
  TOGGLE_FOLDER_EXPANSION,
  UPDATE_DESCRIPTION_SUCCESS,
  UPDATE_FOLDER_COUNTER,
} from 'controllers/testCase/constants';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';

import { queueReducers } from 'common/utils';
import { Folder } from './types';
import {
  DeleteFolderSuccessParams,
  DeleteTestCaseParams,
  MoveFolderParams,
  RenameFolderParams,
  SetExpandedFolderIdsParams,
  ToggleFolderExpansionParams,
  UpdateFolderCounterParams,
} from './actionCreators';

export type InitialStateType = {
  folders: {
    data: Folder[];
    isCreatingFolder: boolean;
    isLoadingFolder: boolean;
    loading: boolean;
    activeFolderId?: number | null;
    expandedFolderIds: number[];
    areFoldersFetched: boolean;
  };
  testCases: {
    isLoading: boolean;
    list: TestCase[];
    page: Page[];
  };
};

export const INITIAL_STATE: InitialStateType = {
  folders: {
    data: [],
    isCreatingFolder: false,
    isLoadingFolder: false,
    loading: false,
    activeFolderId: null,
    expandedFolderIds: [],
    areFoldersFetched: false,
  },
  testCases: {
    isLoading: false,
    list: [],
    page: null,
  },
};

type InitialDetailsStateType = {
  data: TestCase;
  loading: boolean;
  error: string;
};

const INITIAL_DETAILS_STATE: InitialDetailsStateType = {
  data: null,
  loading: false,
  error: null,
};

type FolderAction =
  | { type: typeof DELETE_FOLDER_SUCCESS; payload: DeleteFolderSuccessParams }
  | { type: typeof RENAME_FOLDER_SUCCESS; payload: RenameFolderParams }
  | { type: typeof MOVE_FOLDER_SUCCESS; payload: MoveFolderParams }
  | { type: typeof CREATE_FOLDER_SUCCESS; payload: Folder }
  | { type: typeof CREATE_FOLDERS_BATCH_SUCCESS; payload: Folder[] }
  | { type: typeof UPDATE_FOLDER_COUNTER; payload: UpdateFolderCounterParams };

const isCreatingFolderReducer = (
  state = INITIAL_STATE.folders.isCreatingFolder,
  action: { type: string },
) => {
  switch (action.type) {
    case START_CREATING_FOLDER:
      return true;
    case STOP_CREATING_FOLDER:
      return false;
    default:
      return state;
  }
};

const isLoadingFolderReducer = (
  state = INITIAL_STATE.folders.isLoadingFolder,
  action: { type: string },
) => {
  switch (action.type) {
    case START_LOADING_FOLDER:
      return true;
    case STOP_LOADING_FOLDER:
      return false;
    default:
      return state;
  }
};

const areFoldersFetchedReducer = (
  state = INITIAL_STATE.folders.areFoldersFetched,
  action: { type: string },
) => {
  switch (action.type) {
    case SET_FOLDERS_FETCHED:
      return true;
    default:
      return state;
  }
};

type TestCasesAction =
  | { type: typeof SET_TEST_CASES; payload?: { content: TestCase[]; page: Page } }
  | { type: typeof DELETE_TEST_CASE_SUCCESS; payload: DeleteTestCaseParams }
  | { type: typeof START_LOADING_TEST_CASES }
  | { type: typeof STOP_LOADING_TEST_CASES };

const testCasesReducer = (state = INITIAL_STATE.testCases, action: TestCasesAction) => {
  switch (action.type) {
    case SET_TEST_CASES:
      return {
        ...state,
        list: Array.isArray(action.payload?.content) ? action.payload.content : [],
        page: action.payload?.page || null,
      };
    case DELETE_TEST_CASE_SUCCESS: {
      return {
        ...state,
        list: state.list.filter(({ id }) => action.payload.testCase.id !== id),
      };
    }
    case START_LOADING_TEST_CASES:
      return {
        ...state,
        isLoading: true,
      };
    case STOP_LOADING_TEST_CASES:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const folderReducer = (state = INITIAL_STATE.folders.data, action: FolderAction) => {
  switch (action.type) {
    case DELETE_FOLDER_SUCCESS: {
      return state.filter(({ id }) => !action.payload.deletedFolderIds.includes(id));
    }
    case RENAME_FOLDER_SUCCESS: {
      return state.map((folder) => {
        if (folder.id !== action.payload.folderId) {
          return folder;
        }

        return { ...folder, name: action.payload.folderName };
      });
    }
    case MOVE_FOLDER_SUCCESS: {
      return state.map((folder) => {
        if (folder.id !== action.payload.folderId) {
          return folder;
        }

        return {
          ...folder,
          parentFolderId: action.payload.parentTestFolderId,
          ...(!isNil(action.payload.index) && { index: action.payload.index }),
        };
      });
    }
    case CREATE_FOLDER_SUCCESS: {
      return [...state, action.payload];
    }
    case CREATE_FOLDERS_BATCH_SUCCESS: {
      return [...state, ...action.payload];
    }
    case UPDATE_FOLDER_COUNTER: {
      return state.map((folder) => {
        if (folder.id !== action.payload.folderId) {
          return folder;
        }

        return { ...folder, countOfTestCases: folder.countOfTestCases + action.payload.delta };
      });
    }
    default:
      return state;
  }
};

const testCaseDetailsReducer = (
  state = INITIAL_DETAILS_STATE,
  { type, payload, error }: { type: string; payload?: unknown; error?: string },
) => {
  switch (type) {
    case GET_TEST_CASE_DETAILS:
      return { ...state, loading: true, error: null };
    case GET_TEST_CASE_DETAILS_SUCCESS:
      return { ...state, loading: false, data: payload };
    case GET_TEST_CASE_DETAILS_FAILURE:
      return { ...state, loading: false, error };
    case UPDATE_DESCRIPTION_SUCCESS:
      return { ...state, data: { ...state.data, description: payload } };
    default:
      return state;
  }
};

const getFolderAndDescendantIds = (folders: Folder[], folderId: number): number[] => {
  const folder = folders.find((folder) => folder.id === folderId);

  if (!folder) {
    return [];
  }

  const descendants = folders
    .filter((folder) => folder.parentFolderId === folderId)
    .flatMap((child) => [child.id, ...getFolderAndDescendantIds(folders, child.id)]);

  return [folderId, ...descendants];
};

const hasFolderExpansionPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: ToggleFolderExpansionParams } =>
  hasPayloadProps<ToggleFolderExpansionParams>(action, ['folderId', 'folders']);

const hasDeleteFolderPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: DeleteFolderSuccessParams } =>
  hasPayloadProps<DeleteFolderSuccessParams>(action, ['deletedFolderIds']);

const hasSetExpandedFolderIdsPayload = (action: {
  type: string;
  payload?: unknown;
}): action is { type: string; payload: SetExpandedFolderIdsParams } =>
  hasPayloadProps<SetExpandedFolderIdsParams>(action, ['folderIds']);

const expandedFolderIdsReducer = (
  state = getInitialExpandedFolderIds(TMS_INSTANCE_KEY.TEST_CASE),
  action:
    | { type: typeof TOGGLE_FOLDER_EXPANSION; payload: ToggleFolderExpansionParams }
    | { type: typeof EXPAND_FOLDERS_TO_LEVEL; payload: ToggleFolderExpansionParams }
    | { type: typeof SET_EXPANDED_FOLDER_IDS; payload: SetExpandedFolderIdsParams }
    | { type: typeof DELETE_FOLDER_SUCCESS; payload: DeleteFolderSuccessParams }
    | { type: string },
) => {
  switch (action.type) {
    case TOGGLE_FOLDER_EXPANSION: {
      if (hasFolderExpansionPayload(action)) {
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
    case EXPAND_FOLDERS_TO_LEVEL: {
      if (hasFolderExpansionPayload(action)) {
        const { folderId, folders } = action.payload;
        const folderMap = new Map(folders.map((folder) => [folder.id, folder]));

        const collectParentIds = (id: number): number[] => {
          const folder = folderMap.get(id);

          if (!folder) {
            return [];
          }

          const currentIds = state.includes(id) ? [] : [id];

          if (folder.parentFolderId === null) {
            return currentIds;
          }

          return [...currentIds, ...collectParentIds(folder.parentFolderId)];
        };

        const idsToExpand = collectParentIds(folderId);

        return !isEmpty(idsToExpand) ? [...state, ...idsToExpand] : state;
      }

      return state;
    }
    case SET_EXPANDED_FOLDER_IDS: {
      if (hasSetExpandedFolderIdsPayload(action)) {
        return action.payload.folderIds;
      }

      return state;
    }
    case DELETE_FOLDER_SUCCESS: {
      if (hasDeleteFolderPayload(action)) {
        const { deletedFolderIds } = action.payload;

        return state.filter((id) => !deletedFolderIds.includes(id));
      }

      return state;
    }
    default:
      return state;
  }
};

const reducer = combineReducers({
  details: testCaseDetailsReducer,
  folders: combineReducers({
    data: queueReducers(
      fetchReducer(NAMESPACE, { initialState: [], contentPath: 'content' }),
      folderReducer,
    ),
    expandedFolderIds: expandedFolderIdsReducer,
    isCreatingFolder: isCreatingFolderReducer,
    isLoadingFolder: isLoadingFolderReducer,
    loading: loadingReducer(NAMESPACE),
    areFoldersFetched: areFoldersFetchedReducer,
  }),
  testCases: testCasesReducer,
});

export const testCaseReducer = createPageScopedReducer(reducer, [TEST_CASE_LIBRARY_PAGE]);
