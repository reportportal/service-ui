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
import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import {
  NAMESPACE,
  START_CREATING_FOLDER,
  STOP_CREATING_FOLDER,
  START_LOADING_FOLDER,
  STOP_LOADING_FOLDER,
  START_LOADING_TEST_CASES,
  STOP_LOADING_TEST_CASES,
  SET_TEST_CASES,
  DELETE_TEST_CASE_SUCCESS,
  CREATE_FOLDER_SUCCESS,
  CREATE_FOLDERS_BATCH_SUCCESS,
  RENAME_FOLDER_SUCCESS,
  DELETE_FOLDER_SUCCESS,
  GET_TEST_CASE_DETAILS,
  GET_TEST_CASE_DETAILS_SUCCESS,
  GET_TEST_CASE_DETAILS_FAILURE,
  UPDATE_FOLDER_COUNTER,
  SELECT_ACTIVE_FOLDER,
} from 'controllers/testCase/constants';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';
import { queueReducers } from 'common/utils';
import { Folder } from './types';
import {
  DeleteFolderSuccessParams,
  DeleteTestCaseParams,
  RenameFolderParams,
  SetActiveFolderIdParams,
  UpdateFolderCounterParams,
} from './actionCreators';

export type InitialStateType = {
  folders: {
    data: Folder[];
    isCreatingFolder: boolean;
    isLoadingFolder: boolean;
    loading: boolean;
    activeFolderId?: number | null;
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
  },
  testCases: {
    isLoading: false,
    list: [],
    page: null,
  },
};

const INITIAL_DETAILS_STATE = {
  data: null,
  loading: false,
  error: null,
};

type FolderAction =
  | { type: typeof DELETE_FOLDER_SUCCESS; payload: DeleteFolderSuccessParams }
  | { type: typeof RENAME_FOLDER_SUCCESS; payload: RenameFolderParams }
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
    default:
      return state;
  }
};

const activeFolderReducer = (
  state: number | null = INITIAL_STATE.folders.activeFolderId || null,
  action: { type: string; payload: SetActiveFolderIdParams },
) => {
  switch (action.type) {
    case SELECT_ACTIVE_FOLDER:
      return action.payload.activeFolderId || null;
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
    activeFolderId: activeFolderReducer,
    isCreatingFolder: isCreatingFolderReducer,
    isLoadingFolder: isLoadingFolderReducer,
    loading: loadingReducer(NAMESPACE),
  }),
  testCases: testCasesReducer,
});

export const testCaseReducer = createPageScopedReducer(reducer, [TEST_CASE_LIBRARY_PAGE]);
