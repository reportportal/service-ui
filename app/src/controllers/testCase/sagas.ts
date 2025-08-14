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

import { Action } from 'redux';
import { takeEvery, call, select, all, put, fork, cancel } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch, delayedPut } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { SPINNER_DEBOUNCE } from 'pages/inside/common/constants';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { GET_FOLDERS, CREATE_FOLDER, GET_TEST_CASES, Folder } from './constants';
import {
  updateFoldersAction,
  startCreatingFolderAction,
  stopCreatingFolderAction,
  setFoldersAction,
  GetTestCasesParams,
  CreateFolderParams,
} from './actionCreators';
import { Task } from 'redux-saga';

interface GetTestCasesAction extends Action<typeof GET_TEST_CASES> {
  payload?: GetTestCasesParams;
}

interface CreateFolderAction extends Action<typeof CREATE_FOLDER> {
  payload: CreateFolderParams;
}

function* getTestCases(action: GetTestCasesAction) {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield call(fetch, URLS.testCase(projectKey, action.payload));
  } catch (error) {
    console.error(error);
  }
}

function* getFolders() {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const folders = (yield call(fetch, URLS.folder(projectKey))) as { content: Folder };
    yield put(setFoldersAction(folders.content));
  } catch (error) {
    console.error(error);
  }
}

function* createFolder(action: CreateFolderAction) {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const spinnerTask = (yield fork(
      delayedPut,
      startCreatingFolderAction(),
      SPINNER_DEBOUNCE,
    )) as Task;
    const folder = (yield call(fetch, URLS.folder(projectKey), {
      method: 'POST',
      data: {
        name: action.payload.folderName,
      },
    })) as Folder;
    yield cancel(spinnerTask);
    yield put(updateFoldersAction(folder));
    yield put(hideModalAction());
    yield put(
      showSuccessNotification({
        message: null,
        messageId: 'testCaseFolderCreatedSuccess',
        values: {},
      }),
    );
  } catch (error: unknown) {
    yield put(
      showErrorNotification({
        message: (error as { error?: string })?.error,
        messageId: null,
        values: {},
      }),
    );
  } finally {
    yield put(stopCreatingFolderAction());
  }
}

function* watchGetFolders() {
  yield takeEvery(GET_FOLDERS, getFolders);
}

function* watchCreateFolder() {
  yield takeEvery(CREATE_FOLDER, createFolder);
}

function* watchGetTestCases() {
  yield takeEvery(GET_TEST_CASES, getTestCases);
}

export function* testCaseSagas() {
  yield all([watchGetTestCases(), watchGetFolders(), watchCreateFolder()]);
}
