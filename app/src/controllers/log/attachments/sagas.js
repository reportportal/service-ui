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

import { takeLatest, call, put, all, select, take } from 'redux-saga/effects';
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
import { JSON as JSON_TYPE } from 'common/constants/fileTypes';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import {
  ATTACHMENT_IMAGE_MODAL_ID,
  ATTACHMENT_CODE_MODAL_ID,
  ATTACHMENT_HAR_FILE_MODAL_ID,
  OPEN_ATTACHMENT_ACTION,
  FETCH_ATTACHMENTS_CONCAT_ACTION,
  ATTACHMENTS_NAMESPACE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_LOADED_PAGES,
  FETCH_FIRST_ATTACHMENTS_ACTION,
} from './constants';
import { setActiveAttachmentAction } from './actionCreators';
import { getAttachmentModalId, extractExtension, isTextWithJson } from './utils';

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
  yield put(setActiveAttachmentAction(null));
  yield call(fetchAttachmentsConcat, { payload: { params } });
}

export function fetchImageData({ projectId, binaryId }) {
  return fetch(URLS.getFileById(projectId, binaryId), { responseType: 'blob' });
}

export function fetchData({ projectId, binaryId }) {
  return fetch(URLS.getFileById(projectId, binaryId));
}

/* IMAGE */
function* openImageModalsWorker({ projectId, binaryId }) {
  const data = yield call(fetchImageData, { projectId, binaryId });
  const imageURL = URL.createObjectURL(data);
  yield put(showModalAction({ id: ATTACHMENT_IMAGE_MODAL_ID, data: { image: imageURL } }));
  yield take(HIDE_MODAL);
  URL.revokeObjectURL(imageURL);
}

/* HAR */
function* openHarModalsWorker(data) {
  const harData = yield call(fetchData, data);
  yield put(showModalAction({ id: ATTACHMENT_HAR_FILE_MODAL_ID, data: { harData } }));
}

/* BINARY */
function* openBinaryModalsWorker(data) {
  const binaryData = yield call(fetchData, data);
  const content =
    data.extension === JSON_TYPE && !isTextWithJson(data.contentType)
      ? JSON.stringify(binaryData, null, 4)
      : binaryData;
  yield put(
    showModalAction({
      id: ATTACHMENT_CODE_MODAL_ID,
      data: { extension: data.extension, content },
    }),
  );
}

const ATTACHMENT_MODAL_WORKERS = {
  [ATTACHMENT_IMAGE_MODAL_ID]: openImageModalsWorker,
  [ATTACHMENT_HAR_FILE_MODAL_ID]: openHarModalsWorker,
  [ATTACHMENT_CODE_MODAL_ID]: openBinaryModalsWorker,
};

function* openAttachment({ payload: { id, contentType } }) {
  const modalId = getAttachmentModalId(contentType);
  const projectId = yield select(activeProjectSelector);
  if (modalId) {
    const data = { projectId, binaryId: id, extension: extractExtension(contentType), contentType };
    try {
      yield call(ATTACHMENT_MODAL_WORKERS[modalId], data);
    } catch (e) {} // eslint-disable-line no-empty
  } else {
    const data = yield call(fetch, URLS.getFileById(projectId, id), { responseType: 'blob' });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(data);
    } else {
      const url = URL.createObjectURL(data);
      const newWindow = window.open(url);
      newWindow.onbeforeunload = () => URL.revokeObjectURL(url);
    }
  }
}

function* watchFetchAttachments() {
  yield takeLatest(FETCH_ATTACHMENTS_CONCAT_ACTION, fetchAttachmentsConcat);
}

function* watchFetchFirstAttachments() {
  yield takeLatest(FETCH_FIRST_ATTACHMENTS_ACTION, fetchFirstAttachments);
}

function* watchOpenAttachment() {
  yield takeLatest(OPEN_ATTACHMENT_ACTION, openAttachment);
}

export function* attachmentSagas() {
  yield all([watchOpenAttachment(), watchFetchAttachments(), watchFetchFirstAttachments()]);
}
