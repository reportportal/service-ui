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
import {
  UPDATE_FOLDERS,
  START_CREATING_FOLDER,
  STOP_CREATING_FOLDER,
  SET_FOLDERS,
  Folder,
  START_LOADING_TEST_CASES,
  STOP_LOADING_TEST_CASES,
  SET_TEST_CASES,
} from 'controllers/testCase/constants';

type Folder = {
  name: string;
  countOfTestCases: number;
};

export type TestCase = {
  name: string;
  id: number;
  priority: string;
  testFolder: {
    id: number;
  };
  tags: string[];
};

export type InitialStateType = {
  folders: {
    isCreatingFolder: boolean;
    list: Folder[];
  };
  testCases: {
    isLoading: boolean;
    list: TestCase[];
  };
};

export const INITIAL_STATE: InitialStateType = {
  folders: {
    list: [],
    isCreatingFolder: false,
  },
  testCases: {
    isLoading: false,
    list: [],
  },
};

const foldersReducer = (state = INITIAL_STATE.folders, { type, payload = {} }) => {
  switch (type) {
    case SET_FOLDERS:
      return {
        ...state,
        list: payload,
      };
    case UPDATE_FOLDERS:
      return {
        ...state,
        list: [...state.list, payload],
      };
    case START_CREATING_FOLDER:
      return {
        ...state,
        isCreatingFolder: true,
      };
    case STOP_CREATING_FOLDER:
      return {
        ...state,
        isCreatingFolder: false,
      };
    default:
      return state;
  }
};

const testCasesReducer = (state = INITIAL_STATE.testCases, { type, payload = {} }) => {
  switch (type) {
    case SET_TEST_CASES:
      return {
        ...state,
        list: payload,
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

export const testCaseReducer = combineReducers({
  folders: foldersReducer,
  testCases: testCasesReducer,
});
