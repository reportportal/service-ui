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
import { projectKeySelector } from 'controllers/project';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
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
  const projectKey = yield select(projectKeySelector);
  const isLaunchLog = yield select(isLaunchLogSelector);
  const activeRetryId = yield select(activeRetryIdSelector);
  if (isLaunchLog) {
    return URLS.launchLogs(projectKey, activeRetryId);
  }
  const logViewMode = yield select(logViewModeSelector);
  if (logViewMode === DETAILED_LOG_VIEW) {
    const activeRetry = yield select(activeRetrySelector);
    const retryParentId = yield select(activeLogIdSelector);
    return URLS.logsUnderPath(
      projectKey,
      activeRetry.path,
      retryParentId === activeRetryId ? retryParentId : undefined,
    );
  }
  return URLS.logItems(projectKey, activeRetryId);
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

export function fetchFileData({ projectKey, id }, params) {
  return fetch(URLS.getFileById(projectKey, id), params);
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
  const { organizationSlug, projectSlug } = yield select(urlOrganizationAndProjectSelector);

  if (modalId) {
    const data = {
      organizationSlug,
      projectSlug,
      extension: extractExtension(contentType),
      contentType,
      id,
    };
    try {
      yield call(ATTACHMENT_MODAL_WORKERS[modalId], data);
    } catch {} // eslint-disable-line no-empty
  }
}

function* downloadAttachment({ payload: { id, contentType } }) {
  const projectKey = yield select(projectKeySelector);

  downloadFile(URLS.getFileById(projectKey, id), createAttachmentName(id, contentType));
}

function* openAttachmentInBrowser({ payload: id }) {
  const projectKey = yield select(projectKeySelector);
  const data = yield call(fetch, URLS.getFileById(projectKey, id), { responseType: 'blob' });

  if (window.navigator?.msSaveOrOpenBlob) {
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
