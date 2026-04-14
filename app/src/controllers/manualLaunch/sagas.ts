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
import { takeLatest, call, select, all, put, cancelled } from 'redux-saga/effects';
import { isString } from 'es-toolkit';
import { isEmpty, isNil, isNumber } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { normalizePrioritiesForExecutionApi } from 'pages/inside/common/testCaseList/filterSidePanel/utils';
import { FOLDER_FILTER_KEYS, MANUAL_LAUNCH_EXECUTION_FILTER_KEYS } from 'pages/inside/common/testCaseList/constants';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import { AppState } from 'types/store';
import {
  showNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
  showErrorNotification,
} from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { locationSelector, MANUAL_LAUNCHES_PAGE } from 'controllers/pages';
import { LocationInfo } from 'controllers/pages/typed-selectors';
import { Launch, UrlsHelper } from 'pages/inside/manualLaunchesPage/types';
import { Page } from 'types/common';

import {
  GET_MANUAL_LAUNCHES,
  GET_MANUAL_LAUNCH,
  GET_MANUAL_LAUNCH_FOLDERS,
  GET_MANUAL_LAUNCH_TEST_CASE_EXECUTIONS,
  GET_MANUAL_LAUNCH_EXECUTION,
  UPDATE_MANUAL_LAUNCH_EXECUTION_STATUS,
  GET_MANUAL_LAUNCH_FILTERED_FOLDERS,
  MANUAL_LAUNCHES_NAMESPACE,
  ACTIVE_MANUAL_LAUNCH_NAMESPACE,
  MANUAL_LAUNCH_FOLDERS_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
  ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE,
  TEST_FOLDER_ID_FILTER_KEY,
  MANUAL_LAUNCH_NAME_FILTER_KEY,
  MANUAL_LAUNCH_STATUS_FILTER_KEY,
  MANUAL_LAUNCH_FOLDER_SEARCH_FILTER_KEY,
  MANUAL_LAUNCH_FOLDER_STATUS_FILTER_KEY,
  MANUAL_LAUNCH_ITEM_STATUS_FILTER_KEY,
  MANUAL_LAUNCH_COMPLETION_FILTER_KEY,
  MANUAL_LAUNCH_START_TIME_GT_FILTER_KEY,
  MANUAL_LAUNCH_END_TIME_LT_FILTER_KEY,
  MANUAL_LAUNCH_TEST_PLAN_ID_FILTER_KEY,
  MANUAL_LAUNCH_COMPOSITE_ATTRIBUTE_FILTER_KEY,
  defaultManualLaunchesQueryParams,
} from './constants';
import {
  GetManualLaunchesParams,
  GetManualLaunchParams,
  GetManualLaunchFoldersParams,
  GetManualLaunchTestCaseExecutionsParams,
  GetManualLaunchExecutionParams,
  UpdateManualLaunchExecutionStatusParams,
  GetManualLaunchFilteredFoldersParams,
  ManualLaunchFoldersResponse,
  ManualLaunchFolder,
  TestCaseExecutionsResponse,
  TestCaseExecution,
} from './types';
import { manualLaunchContentSelector, activeManualLaunchSelector } from './selectors';
import {
  setManualLaunchFilteredFoldersAction,
  startLoadingManualLaunchFilteredFoldersAction,
  stopLoadingManualLaunchFilteredFoldersAction,
} from './actionCreators';

interface GetManualLaunchesAction extends Action<typeof GET_MANUAL_LAUNCHES> {
  payload?: GetManualLaunchesParams;
}

function* getManualLaunches(action: GetManualLaunchesAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: MANUAL_LAUNCHES_NAMESPACE },
    });

    const typedURLS = URLS as UrlsHelper;

    const trimmedNameSearch = action.payload?.searchQuery?.trim();

    let params: Record<string, string | number | undefined>;

    if (action.payload) {
      const {
        limit,
        offset,
        filterStatuses,
        filterCompletion,
        filterStartTimeFrom,
        filterEndTimeTo,
        filterTestPlan,
        filterCompositeAttribute,
      } = action.payload;

      params = {
        limit,
        offset,
        [MANUAL_LAUNCH_NAME_FILTER_KEY]: trimmedNameSearch || undefined,
      };

      if (filterStatuses && !isEmpty(filterStatuses)) {
        params[MANUAL_LAUNCH_ITEM_STATUS_FILTER_KEY] = filterStatuses.join(',');
      }

      if (filterCompletion) {
        params[MANUAL_LAUNCH_COMPLETION_FILTER_KEY] = filterCompletion;
      }

      if (isNumber(filterStartTimeFrom)) {
        params[MANUAL_LAUNCH_START_TIME_GT_FILTER_KEY] = filterStartTimeFrom;
      }

      if (isNumber(filterEndTimeTo)) {
        params[MANUAL_LAUNCH_END_TIME_LT_FILTER_KEY] = filterEndTimeTo;
      }

      if (filterTestPlan) {
        params[MANUAL_LAUNCH_TEST_PLAN_ID_FILTER_KEY] = filterTestPlan;
      }

      if (filterCompositeAttribute) {
        params[MANUAL_LAUNCH_COMPOSITE_ATTRIBUTE_FILTER_KEY] = filterCompositeAttribute;
      }
    } else {
      params = { ...defaultManualLaunchesQueryParams };
    }

    const data = (yield call(
      fetch,
      typedURLS.manualLaunchesListPagination(projectKey, params),
    )) as {
      content: Launch[];
      page: Page;
    };

    yield put(
      fetchSuccessAction(MANUAL_LAUNCHES_NAMESPACE, {
        data,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(MANUAL_LAUNCHES_NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'manualLaunchesLoadingFailed',
      }),
    );
  }
}

interface GetManualLaunchAction extends Action<typeof GET_MANUAL_LAUNCH> {
  payload: GetManualLaunchParams;
}

function* getManualLaunch(action: GetManualLaunchAction): Generator {
  const projectKey = (yield select(projectKeySelector)) as string;
  const location = (yield select(locationSelector)) as LocationInfo;

  const { launchId } = action.payload;

  try {
    const prevLaunchId = location?.prev?.payload?.launchId;
    const currentLaunchId = location?.payload?.launchId;
    const activeManualLaunch = (yield select(activeManualLaunchSelector)) as Launch | null;

    if (
      !prevLaunchId ||
      String(prevLaunchId) !== String(currentLaunchId) ||
      !activeManualLaunch ||
      String(activeManualLaunch.id) !== String(launchId)
    ) {
      const fetchedLaunches = (yield select(manualLaunchContentSelector)) as Launch[] | null;
      const launchFromList = fetchedLaunches?.find((launch) => launch.id === Number(launchId));

      if (launchFromList) {
        yield put(fetchSuccessAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, launchFromList));
      } else {
        yield put({
          type: FETCH_START,
          payload: { projectKey },
          meta: { namespace: ACTIVE_MANUAL_LAUNCH_NAMESPACE },
        });

        const data = (yield call(fetch, URLS.manualLaunchById(projectKey, launchId))) as Launch;

        yield put(fetchSuccessAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, data));
      }
    }
  } catch (error) {
    yield put(fetchErrorAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, error, true));
    yield put(
      showNotification({
        messageId: 'manualLaunchRedirectWarningMessage',
        type: NOTIFICATION_TYPES.WARNING,
        typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
        duration: WARNING_NOTIFICATION_DURATION,
      }),
    );

    yield put({
      type: MANUAL_LAUNCHES_PAGE,
      payload: {
        organizationSlug: location.payload.organizationSlug,
        projectSlug: location.payload.projectSlug,
      },
    });
  }
}

interface GetManualLaunchFoldersAction extends Action<typeof GET_MANUAL_LAUNCH_FOLDERS> {
  payload: GetManualLaunchFoldersParams;
}

function* getManualLaunchFolders(action: GetManualLaunchFoldersAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const { launchId, offset, limit, filterPriorities, filterTags, statusFilter } = action.payload;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: MANUAL_LAUNCH_FOLDERS_NAMESPACE },
    });

    const typedURLS = URLS as UrlsHelper;
    const params: Record<string, string | number> = {
      offset,
      limit,
    };

    if (filterPriorities) {
      params[FOLDER_FILTER_KEYS.priority] = filterPriorities.toUpperCase();
    }

    if (filterTags) {
      params[FOLDER_FILTER_KEYS.attributeKey] = filterTags;
    }

    if (statusFilter) {
      params[MANUAL_LAUNCH_FOLDER_STATUS_FILTER_KEY] = statusFilter;
    }

    const data = (yield call(
      fetch,
      typedURLS.manualLaunchFolders(projectKey, launchId, params),
    )) as ManualLaunchFoldersResponse;

    yield put(
      fetchSuccessAction(MANUAL_LAUNCH_FOLDERS_NAMESPACE, {
        data,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(MANUAL_LAUNCH_FOLDERS_NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  }
}

interface GetManualLaunchTestCaseExecutionsAction extends Action<
  typeof GET_MANUAL_LAUNCH_TEST_CASE_EXECUTIONS
> {
  payload: GetManualLaunchTestCaseExecutionsParams;
}

function* getManualLaunchTestCaseExecutions(
  action: GetManualLaunchTestCaseExecutionsAction,
): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const {
      launchId,
      offset,
      limit,
      folderId,
      searchQuery,
      statusFilter,
      filterPriorities,
      filterTags,
    } = action.payload;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE },
    });

    const typedURLS = URLS as UrlsHelper;
    const params: Record<string, string | number> = {
      offset,
      limit,
    };

    const normalizedExecutionPriorities = normalizePrioritiesForExecutionApi(filterPriorities);

    if (normalizedExecutionPriorities) {
      params[MANUAL_LAUNCH_EXECUTION_FILTER_KEYS.priority] = normalizedExecutionPriorities;
    }

    if (filterTags) {
      params[MANUAL_LAUNCH_EXECUTION_FILTER_KEYS.attributeKey] = filterTags;
    }

    if (!isNil(folderId)) {
      params[TEST_FOLDER_ID_FILTER_KEY] = folderId;
    }

    const trimmedSearch = searchQuery?.trim();

    if (trimmedSearch) {
      params[MANUAL_LAUNCH_NAME_FILTER_KEY] = trimmedSearch;
    }

    if (statusFilter) {
      params[MANUAL_LAUNCH_STATUS_FILTER_KEY] = statusFilter;
    }

    const data = (yield call(
      fetch,
      typedURLS.manualLaunchTestCaseExecutions(projectKey, launchId, params),
    )) as TestCaseExecutionsResponse;

    yield put(
      fetchSuccessAction(MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE, {
        data,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  }
}

interface GetManualLaunchExecutionAction extends Action<typeof GET_MANUAL_LAUNCH_EXECUTION> {
  payload: GetManualLaunchExecutionParams;
}

function* getManualLaunchExecution(action: GetManualLaunchExecutionAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const { launchId, executionId } = action.payload;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE },
    });

    const typedURLS = URLS as UrlsHelper;
    const data = (yield call(
      fetch,
      typedURLS.manualLaunchExecutionById(projectKey, launchId, executionId),
    )) as TestCaseExecution;

    if (data) {
      yield put(fetchSuccessAction(ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE, data));
    } else {
      yield put(
        fetchErrorAction(
          ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE,
          new Error('Execution not found'),
        ),
      );
      yield put(
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        }),
      );
    }
  } catch (error) {
    yield put(
      fetchErrorAction(
        ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE,
        error instanceof Error ? error : new Error(String(error)),
      ),
    );
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  }
}

interface GetManualLaunchFilteredFoldersAction extends Action<
  typeof GET_MANUAL_LAUNCH_FILTERED_FOLDERS
> {
  payload: GetManualLaunchFilteredFoldersParams;
}

function* getManualLaunchFilteredFolders(
  action: GetManualLaunchFilteredFoldersAction,
): Generator {
  const projectKey = (yield select(projectKeySelector)) as string;
  const { launchId, searchQuery, filterPriorities, filterTags, statusFilter } = action.payload;

  if (!projectKey || !searchQuery) {
    yield put(setManualLaunchFilteredFoldersAction([]));
    return;
  }

  try {
    yield put(startLoadingManualLaunchFilteredFoldersAction());

    const typedURLS = URLS as UrlsHelper;
    const allFolders: ManualLaunchFolder[] = [];
    const limit = 100;
    let offset = 0;
    let totalElements = Infinity;

    while (offset < totalElements) {
      const folderListParams: Record<string, string | number> = {
        offset,
        limit,
        [MANUAL_LAUNCH_FOLDER_SEARCH_FILTER_KEY]: searchQuery,
      };

      if (filterPriorities) {
        folderListParams[FOLDER_FILTER_KEYS.priority] = filterPriorities.toUpperCase();
      }

      if (filterTags) {
        folderListParams[FOLDER_FILTER_KEYS.attributeKey] = filterTags;
      }

      if (statusFilter) {
        folderListParams[MANUAL_LAUNCH_FOLDER_STATUS_FILTER_KEY] = statusFilter;
      }

      const response = (yield call(
        fetch,
        typedURLS.manualLaunchFolders(projectKey, launchId, folderListParams),
      )) as ManualLaunchFoldersResponse;

      allFolders.push(...response.content);
      totalElements = response.page.totalElements;
      offset += limit;
    }

    yield put(setManualLaunchFilteredFoldersAction(allFolders));
  } catch {
    yield put(setManualLaunchFilteredFoldersAction([]));
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  } finally {
    if (!(yield cancelled())) {
      yield put(stopLoadingManualLaunchFilteredFoldersAction());
    }
  }
}

function* watchGetManualLaunches() {
  yield takeLatest(GET_MANUAL_LAUNCHES, getManualLaunches);
}

function* watchGetManualLaunch() {
  yield takeLatest(GET_MANUAL_LAUNCH, getManualLaunch);
}

function* watchGetManualLaunchFolders() {
  yield takeLatest(GET_MANUAL_LAUNCH_FOLDERS, getManualLaunchFolders);
}

function* watchGetManualLaunchTestCaseExecutions() {
  yield takeLatest(GET_MANUAL_LAUNCH_TEST_CASE_EXECUTIONS, getManualLaunchTestCaseExecutions);
}

function* watchGetManualLaunchExecution() {
  yield takeLatest(GET_MANUAL_LAUNCH_EXECUTION, getManualLaunchExecution);
}

interface UpdateManualLaunchExecutionStatusAction extends Action<
  typeof UPDATE_MANUAL_LAUNCH_EXECUTION_STATUS
> {
  payload: UpdateManualLaunchExecutionStatusParams;
}

function* uploadAttachments(projectKey: string, attachments?: File[]): Generator {
  const uploadedAttachments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }> = [];

  if (!attachments || attachments.length === 0) {
    return uploadedAttachments;
  }

  for (const file of attachments) {
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const uploadResponse = (yield call(fetch, URLS.tmsAttachmentUpload(projectKey), {
        method: 'POST',
        data: formData,
      })) as { id: string };

      uploadedAttachments.push({
        id: uploadResponse.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    } catch {
      yield put(
        showNotification({
          messageId: 'ExecutionStatusConfirmModal.attachmentUploadFailed',
          type: NOTIFICATION_TYPES.ERROR,
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.WHITE,
          duration: WARNING_NOTIFICATION_DURATION,
          values: { fileName: file.name },
        }),
      );
    }
  }

  return uploadedAttachments;
}

function* updateManualLaunchExecutionStatus(
  action: UpdateManualLaunchExecutionStatusAction,
): Generator {
  const { projectKey, launchId, executionId, status, comment, attachments } = action.payload;

  try {
    const requestData: {
      status: string;
      executionComment?: {
        comment?: string;
        attachments?: Array<{ id: string; fileName: string; fileType: string; fileSize: number }>;
      };
    } = {
      status,
    };

    const uploadedAttachments = (yield call(uploadAttachments, projectKey, attachments)) as Array<{
      id: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }>;

    const trimmedComment = isString(comment) ? comment.trim() : '';
    const hasAttachments = !isEmpty(uploadedAttachments);

    if (trimmedComment || hasAttachments) {
      requestData.executionComment = {};

      if (trimmedComment) {
        requestData.executionComment.comment = trimmedComment;
      }

      if (hasAttachments) {
        requestData.executionComment.attachments = uploadedAttachments;
      }
    }

    const data = (yield call(
      fetch,
      URLS.manualLaunchExecutionById(projectKey, launchId, executionId),
      {
        method: 'PATCH',
        data: requestData,
      },
    )) as TestCaseExecution;

    yield put(fetchSuccessAction(ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE, data));

    const executionsState = (yield select(
      (state: AppState) => state.manualLaunchTestCaseExecutions?.data,
    )) as { content: TestCaseExecution[]; page: Page } | null;

    if (executionsState?.content) {
      const updatedContent = executionsState.content.map((exec) =>
        exec.id === data.id ? data : exec,
      );

      yield put(
        fetchSuccessAction(MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE, {
          data: {
            content: updatedContent,
            page: executionsState.page,
          },
        }),
      );
    }

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    yield put(
      showNotification({
        messageId: 'executionStatusUpdated',
        type: NOTIFICATION_TYPES.SUCCESS,
        typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.WHITE,
        duration: WARNING_NOTIFICATION_DURATION,
        values: { status: capitalizedStatus },
      }),
    );
  } catch {
    yield put(
      showErrorNotification({
        messageId: 'errorOccurredTryAgain',
      }),
    );
  }
}

function* watchUpdateManualLaunchExecutionStatus() {
  yield takeLatest(UPDATE_MANUAL_LAUNCH_EXECUTION_STATUS, updateManualLaunchExecutionStatus);
}

function* watchGetManualLaunchFilteredFolders() {
  yield takeLatest(GET_MANUAL_LAUNCH_FILTERED_FOLDERS, getManualLaunchFilteredFolders);
}

export function* manualLaunchesSagas() {
  yield all([
    watchGetManualLaunches(),
    watchGetManualLaunch(),
    watchGetManualLaunchFolders(),
    watchGetManualLaunchTestCaseExecutions(),
    watchGetManualLaunchExecution(),
    watchUpdateManualLaunchExecutionStatus(),
    watchGetManualLaunchFilteredFolders(),
  ]);
}
