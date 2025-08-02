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

import { takeEvery, call, select, all, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { delay, fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { SPINNER_DEBOUNCE } from 'pages/inside/testCaseLibraryPage/constants';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { GET_FOLDERS, CREATE_FOLDER } from './constants';
import {
  updateFoldersAction,
  startCreatingFolderAction,
  stopCreatingFolderAction,
} from './actionCreators';

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

    yield call(delay, SPINNER_DEBOUNCE);
    yield put(startCreatingFolderAction());
    yield call(fetch, URLS.folder(projectKey), {
      method: 'POST',
      data: {
        name: payload.folderName,
      },
    });
    yield put(hideModalAction());
    yield put(
      showSuccessNotification({
        message: null,
        messageId: 'testCaseFolderCreatedSuccess',
        values: {},
      }),
    );
    yield getFolders();
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

export function* testCaseSagas() {
  yield all([watchGetFolders(), watchCreateFolder()]);
}
