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
  START_CREATING_FOLDER,
  STOP_CREATING_FOLDER,
  NAMESPACE,
  START_LOADING_TEST_CASES,
  STOP_LOADING_TEST_CASES,
  SET_TEST_CASES,
} from 'controllers/testCase/constants';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';

export type InitialStateType = {
  folders: {
    isCreatingFolder: boolean;
    loading: boolean;
  };
  testCases: {
    isLoading: boolean;
    list: TestCase[];
  };
};

export const INITIAL_STATE: InitialStateType = {
  folders: {
    isCreatingFolder: false,
    loading: false,
  },
  testCases: {
    isLoading: false,
    list: [],
  },
};

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

const testCasesReducer = (
  state = INITIAL_STATE.testCases,
  action: { type: string; payload?: unknown },
) => {
  switch (action.type) {
    case SET_TEST_CASES:
      return {
        ...state,
        list: Array.isArray(action.payload) ? (action.payload as TestCase[]) : [],
      };
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

const reducer = combineReducers({
  folders: combineReducers({
    data: fetchReducer(NAMESPACE, { initialState: [], contentPath: 'content' }),
    isCreatingFolder: isCreatingFolderReducer,
    loading: loadingReducer(NAMESPACE),
  }),
  testCases: testCasesReducer,
});

export const testCaseReducer = createPageScopedReducer(reducer, [TEST_CASE_LIBRARY_PAGE]);
