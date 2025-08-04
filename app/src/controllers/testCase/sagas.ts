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
import { takeEvery, call, select, all, put, race } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { delay, fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { SPINNER_DEBOUNCE } from 'pages/inside/common/constants';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { foldersSelector } from 'controllers/testCase/selectors';
import { GET_FOLDERS, CREATE_FOLDER, GET_TEST_CASES } from './constants';
import {
  updateFoldersAction,
  startCreatingFolderAction,
  stopCreatingFolderAction,
  GetTestCasesParams,
} from './actionCreators';

interface GetTestCasesAction extends Action<typeof GET_TEST_CASES> {
  payload?: GetTestCasesParams;
}

function* getTestCases(action: GetTestCasesAction) {
  try {
    const projectKey = yield select(projectKeySelector);

    yield call(fetch, URLS.testCase(projectKey, action.payload));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

function* getFolders() {
  try {
    const projectKey = yield select(projectKeySelector);
    const folders = yield call(fetch, URLS.folder(projectKey));
    yield put(updateFoldersAction(folders.content));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

function* createFolder({ payload }) {
  try {
    const projectKey = yield select(projectKeySelector);
    const folders = yield select(foldersSelector);
    const apiCall = call(fetch, URLS.folder(projectKey), {
      method: 'POST',
      data: {
        name: payload.folderName,
      },
    });
    const { folder, spinner } = yield race({
      folder: apiCall,
      spinner: delay(SPINNER_DEBOUNCE),
    });

    if (spinner) {
      yield put(startCreatingFolderAction());
      const folderResult = yield apiCall;
      yield put(updateFoldersAction([...folders, folderResult]));
    } else if (folder) {
      yield put(updateFoldersAction([...folders, folder]));
    }

    yield put(hideModalAction());
    yield put(
      showSuccessNotification({
        message: null,
        messageId: 'testCaseFolderCreatedSuccess',
        values: {},
      }),
    );
  } catch (error) {
    yield put(
      showErrorNotification({
        message: error?.error,
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
