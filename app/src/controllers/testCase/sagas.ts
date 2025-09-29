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
import { takeEvery, call, select, all, put, fork, cancel, takeLatest } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import { URLS } from 'common/urls';
import { fetch, delayedPut } from 'common/utils';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
  showDefaultErrorNotification,
  showErrorNotification,
  showNotification,
  showSuccessNotification,
} from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { SPINNER_DEBOUNCE } from 'pages/inside/common/constants';
import { hideModalAction } from 'controllers/modal';
import {
  GET_FOLDERS,
  CREATE_FOLDER,
  DELETE_FOLDER,
  GET_TEST_CASES,
  GET_TEST_CASES_BY_FOLDER_ID,
  GET_ALL_TEST_CASES,
  GET_TEST_CASE_DETAILS,
  GET_TEST_CASE_DETAILS_FAILURE,
  GET_TEST_CASE_DETAILS_SUCCESS,
  NAMESPACE,
  RENAME_FOLDER,
} from './constants';
import { Folder } from './types';
import {
  createFoldersSuccessAction,
  startCreatingFolderAction,
  stopCreatingFolderAction,
  startLoadingFolderAction,
  stopLoadingFolderAction,
  GetTestCasesParams,
  CreateFolderParams,
  DeleteFolderParams,
  RenameFolderParams,
  GetTestCasesByFolderIdParams,
  startLoadingTestCasesAction,
  stopLoadingTestCasesAction,
  setTestCasesAction,
  deleteFolderSuccessAction,
  renameFolderSuccessAction,
} from './actionCreators';
import { getAllFolderIdsToDelete } from './utils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { foldersSelector } from 'controllers/testCase/selectors';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';

interface GetTestCasesAction extends Action<typeof GET_TEST_CASES> {
  payload?: GetTestCasesParams;
}

interface GetTestCasesByFolderIdAction extends Action<typeof GET_TEST_CASES_BY_FOLDER_ID> {
  payload: GetTestCasesByFolderIdParams;
}

interface CreateFolderAction extends Action<typeof CREATE_FOLDER> {
  payload: CreateFolderParams;
}

interface DeleteFolderAction extends Action<typeof DELETE_FOLDER> {
  payload: DeleteFolderParams;
}

interface RenameFolderAction extends Action<typeof RENAME_FOLDER> {
  payload: RenameFolderParams;
}

interface TestCaseDetailsAction extends Action<typeof GET_TEST_CASE_DETAILS> {
  payload: {
    testCaseId: string;
  };
}

function* getTestCases(action: GetTestCasesAction) {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield call(fetch, URLS.testCase(projectKey, action.payload));
  } catch (error) {
    console.error(error);
  }
}

function* getTestCasesByFolderId(action: GetTestCasesByFolderIdAction): Generator {
  yield put(startLoadingTestCasesAction());

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const result = (yield call(fetch, URLS.testCasesByFolderId(projectKey, action.payload))) as {
      content: TestCase[];
    };

    yield put(setTestCasesAction(result.content));
  } catch {
    yield put(setTestCasesAction([]));
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  } finally {
    yield put(stopLoadingTestCasesAction());
  }
}

function* getTestCaseDetails(action: TestCaseDetailsAction) {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const testCaseDetails = (yield call(
      fetch,
      URLS.testCaseDetails(projectKey, action.payload.testCaseId),
    )) as TestCase;

    yield put({
      type: GET_TEST_CASE_DETAILS_SUCCESS,
      payload: testCaseDetails,
    });
  } catch {
    const organizationSlug = (yield select(urlOrganizationSlugSelector)) as string;
    const projectSlug = (yield select(urlProjectSlugSelector)) as string;

    yield put({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
      },
    });

    yield put({
      type: GET_TEST_CASE_DETAILS_FAILURE,
      error: 'errorOccurredTryAgain',
    });

    yield put(
      showNotification({
        messageId: 'redirectWarningMessage',
        type: NOTIFICATION_TYPES.WARNING,
        typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
        duration: WARNING_NOTIFICATION_DURATION,
      }),
    );
  }
}

function* getAllTestCases(): Generator {
  yield put(startLoadingTestCasesAction());

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const result = (yield call(fetch, URLS.allTestCases(projectKey))) as {
      content: TestCase[];
    };

    yield put(setTestCasesAction(result.content));
  } catch {
    yield put(setTestCasesAction([]));
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  } finally {
    yield put(stopLoadingTestCasesAction());
  }
}

type FoldersPage = { content: Folder[]; page?: { totalPages?: number } };
const isFoldersPage = (value: unknown): value is FoldersPage => {
  if (!value || typeof value !== 'object') return false;
  return Array.isArray((value as Partial<FoldersPage>).content);
};

function* getFolders() {
  const projectKey = (yield select(projectKeySelector)) as string;

  if (!projectKey) {
    return;
  }

  try {
    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: NAMESPACE },
    });

    const pageSize = 20;
    let pageNumber = 1;
    let totalPages = 1;
    const aggregated: Folder[] = [];

    while (pageNumber <= totalPages) {
      const responseUnknown: unknown = yield call(
        fetch,
        URLS.testFolders(projectKey, {
          'page.page': pageNumber,
          'page.size': pageSize,
          'page.sort': 'id,ASC',
        }),
      );

      if (!isFoldersPage(responseUnknown)) {
        throw new Error('Invalid folders response');
      }

      const content: Folder[] = responseUnknown.content;
      aggregated.push(...content);
      const respTotalPages = responseUnknown.page?.totalPages ?? 1;
      totalPages = respTotalPages;
      pageNumber += 1;
    }

    yield put(
      fetchSuccessAction(NAMESPACE, {
        content: aggregated,
        page: {
          number: 0,
          size: aggregated.length,
          totalElements: aggregated.length,
          totalPages: 1,
        },
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(NAMESPACE, error));
    yield put(
      showDefaultErrorNotification({
        message: error instanceof Error ? error.message : undefined,
      }),
    );
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
    const folder = (yield call(fetch, URLS.testFolders(projectKey), {
      method: 'POST',
      data: {
        name: action.payload.folderName,
        ...(action.payload.parentFolderId
          ? { parentTestFolderId: action.payload.parentFolderId }
          : {}),
      },
    })) as Folder;

    yield cancel(spinnerTask);

    yield put(createFoldersSuccessAction({ ...folder, countOfTestCases: 0 }));
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

function* deleteFolder(action: DeleteFolderAction) {
  try {
    yield put(startLoadingFolderAction());
    const projectKey = (yield select(projectKeySelector)) as string;
    const folders = (yield select(foldersSelector)) as Folder[];
    const { folderId, activeFolderId, setAllTestCases } = action.payload;
    const deletedFolderIds = getAllFolderIdsToDelete(folderId, folders);
    const isActiveFolder = folderId === activeFolderId;

    yield call(fetch, URLS.deleteFolder(projectKey, folderId), {
      method: 'DELETE',
    });

    if (isActiveFolder || deletedFolderIds.includes(activeFolderId)) {
      yield call(setAllTestCases);
    }

    yield put(deleteFolderSuccessAction({ deletedFolderIds }));
    yield put(hideModalAction());
    yield put(
      showSuccessNotification({
        message: null,
        messageId: 'testCaseFolderDeletedSuccess',
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
    yield put(stopLoadingFolderAction());
  }
}

function* renameFolder(action: RenameFolderAction) {
  try {
    yield put(startLoadingFolderAction());
    const projectKey = (yield select(projectKeySelector)) as string;
    const { folderId, folderName } = action.payload;

    yield call(fetch, URLS.deleteFolder(projectKey, folderId), {
      method: 'PATCH',
      data: {
        name: folderName,
      },
    });

    yield put(renameFolderSuccessAction({ folderId, folderName }));
    yield put(hideModalAction());
    yield put(
      showSuccessNotification({
        message: null,
        messageId: 'testCaseFolderRenamedSuccess',
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
    yield put(stopLoadingFolderAction());
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

function* watchGetTestCasesByFolderId() {
  yield takeLatest(GET_TEST_CASES_BY_FOLDER_ID, getTestCasesByFolderId);
}

function* watchGetAllTestCases() {
  yield takeLatest(GET_ALL_TEST_CASES, getAllTestCases);
}

function* watchGetTestCaseDetails() {
  yield takeEvery(GET_TEST_CASE_DETAILS, getTestCaseDetails);
}

export function* testCaseSagas() {
  yield all([
    watchGetTestCases(),
    watchGetTestCaseDetails(),
    watchGetFolders(),
    watchCreateFolder(),
    watchGetTestCasesByFolderId(),
    watchGetAllTestCases(),
    takeEvery(DELETE_FOLDER, deleteFolder),
    takeEvery(RENAME_FOLDER, renameFolder),
  ]);
}
