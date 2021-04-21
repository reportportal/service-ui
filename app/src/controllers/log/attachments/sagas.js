/*
 * Copyright 2019 EPAM Systems
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

import { takeLatest, takeEvery, call, put, all, select, take } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { showModalAction, HIDE_MODAL } from 'controllers/modal';
import { concatFetchDataAction, createFetchPredicate } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import {
  activeRetryIdSelector,
  isLaunchLogSelector,
  logViewModeSelector,
  activeRetrySelector,
  activeLogIdSelector,
} from 'controllers/log/selectors';
import { DETAILED_LOG_VIEW } from 'controllers/log/constants';
import { downloadFile } from 'common/utils/downloadFile';
import { JSON as JSON_TYPE } from 'common/constants/fileTypes';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import {
  ATTACHMENT_CODE_MODAL_ID,
  ATTACHMENT_HAR_FILE_MODAL_ID,
  ATTACHMENT_IMAGE_MODAL_ID,
  FETCH_ATTACHMENTS_CONCAT_ACTION,
  ATTACHMENTS_NAMESPACE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_LOADED_PAGES,
  FETCH_FIRST_ATTACHMENTS_ACTION,
  DOWNLOAD_ATTACHMENT_ACTION,
  OPEN_ATTACHMENT_IN_MODAL_ACTION,
  OPEN_ATTACHMENT_IN_BROWSER_ACTION,
} from './constants';
import {
  getAttachmentModalId,
  extractExtension,
  isTextWithJson,
  createAttachmentName,
} from './utils';

function* getAttachmentURL() {
  const activeProject = yield select(activeProjectSelector);
  const isLaunchLog = yield select(isLaunchLogSelector);
  const activeRetryId = yield select(activeRetryIdSelector);
  if (isLaunchLog) {
    return URLS.launchLogs(activeProject, activeRetryId);
  }
  const logViewMode = yield select(logViewModeSelector);
  if (logViewMode === DETAILED_LOG_VIEW) {
    const activeRetry = yield select(activeRetrySelector);
    const retryParentId = yield select(activeLogIdSelector);
    return URLS.logsUnderPath(
      activeProject,
      activeRetry.path,
      retryParentId === activeRetryId ? retryParentId : undefined,
    );
  }
  return URLS.logItems(activeProject, activeRetryId);
}

function* fetchAttachmentsConcat({ payload: { params, concat } }) {
  const url = yield call(getAttachmentURL);
  yield put(concatFetchDataAction(ATTACHMENTS_NAMESPACE, concat)(url, { params }));
  yield take(createFetchPredicate(ATTACHMENTS_NAMESPACE));
}

function* fetchFirstAttachments({ payload }) {
  const params = {
    'filter.ex.binaryContent': true,
    [SIZE_KEY]: DEFAULT_PAGE_SIZE * DEFAULT_LOADED_PAGES,
    [PAGE_KEY]: 1,
    ...payload.params,
  };
  yield call(fetchAttachmentsConcat, { payload: { params } });
}

export function fetchFileData({ projectId, id }, params) {
  return fetch(URLS.getFileById(projectId, id), params);
}

/* HAR */
function* openHarModalWorker(data) {
  const harData = yield call(fetchFileData, data);
  yield put(showModalAction({ id: ATTACHMENT_HAR_FILE_MODAL_ID, data: { harData } }));
}

/* IMAGE */
function* openImageModalsWorker(data) {
  const imageData = yield call(fetchFileData, data, { responseType: 'blob' });
  const imageURL = URL.createObjectURL(imageData);
  yield put(showModalAction({ id: ATTACHMENT_IMAGE_MODAL_ID, data: { image: imageURL } }));
  yield take(HIDE_MODAL);
  URL.revokeObjectURL(imageURL);
}

/* BINARY */
function* openBinaryModalWorker(data) {
  const binaryData = yield call(fetchFileData, data);
  const content =
    data.extension === JSON_TYPE && !isTextWithJson(data.contentType)
      ? JSON.stringify(binaryData, null, 4)
      : binaryData;
  yield put(
    showModalAction({
      id: ATTACHMENT_CODE_MODAL_ID,
      data: { extension: data.extension, content, id: data.id },
    }),
  );
}

const ATTACHMENT_MODAL_WORKERS = {
  [ATTACHMENT_IMAGE_MODAL_ID]: openImageModalsWorker,
  [ATTACHMENT_HAR_FILE_MODAL_ID]: openHarModalWorker,
  [ATTACHMENT_CODE_MODAL_ID]: openBinaryModalWorker,
};

function* openAttachmentInModal({ payload: { id, contentType } }) {
  const modalId = getAttachmentModalId(contentType);
  const projectId = yield select(activeProjectSelector);

  if (modalId) {
    const data = { projectId, id, extension: extractExtension(contentType), contentType };
    try {
      yield call(ATTACHMENT_MODAL_WORKERS[modalId], data);
    } catch (e) {} // eslint-disable-line no-empty
  }
}

function* downloadAttachment({ payload: { id, contentType } }) {
  const projectId = yield select(activeProjectSelector);

  downloadFile(URLS.getFileById(projectId, id), createAttachmentName(id, contentType));
}

function* openAttachmentInBrowser({ payload: id }) {
  const projectId = yield select(activeProjectSelector);
  const data = yield call(fetch, URLS.getFileById(projectId, id), { responseType: 'blob' });

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(data);
  } else {
    const url = URL.createObjectURL(data);
    const newWindow = window.open(url);
    newWindow.onbeforeunload = () => URL.revokeObjectURL(url);
  }
}

function* watchFetchAttachments() {
  yield takeLatest(FETCH_ATTACHMENTS_CONCAT_ACTION, fetchAttachmentsConcat);
}

function* watchFetchFirstAttachments() {
  yield takeLatest(FETCH_FIRST_ATTACHMENTS_ACTION, fetchFirstAttachments);
}

function* watchOpenAttachmentInModal() {
  yield takeLatest(OPEN_ATTACHMENT_IN_MODAL_ACTION, openAttachmentInModal);
}

function* watchDownloadAttachment() {
  yield takeEvery(DOWNLOAD_ATTACHMENT_ACTION, downloadAttachment);
}

function* watchOpenAttachmentInBrowser() {
  yield takeEvery(OPEN_ATTACHMENT_IN_BROWSER_ACTION, openAttachmentInBrowser);
}

export function* attachmentSagas() {
  yield all([
    watchOpenAttachmentInModal(),
    watchOpenAttachmentInBrowser(),
    watchDownloadAttachment(),
    watchFetchAttachments(),
    watchFetchFirstAttachments(),
  ]);
}
