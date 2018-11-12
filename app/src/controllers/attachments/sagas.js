import { takeLatest, call, put, all, select } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetchAPI } from 'common/utils';
import { showModalAction } from 'controllers/modal';
import { tokenSelector } from 'controllers/auth';

import { GET_ATTACHMENT_HAR, GET_ATTACHMENT_BINARY, GET_ATTACHMENT_IMAGE } from './constants';

export function fetchImageData({ projectId, binaryId }) {
  return new Promise((resolve) =>
    resolve({
      image: URLS.getFileById(projectId, binaryId),
    }),
  );
}

export function* fetchData({ projectId, binaryId }) {
  const token = yield select(tokenSelector);
  const data = yield call(fetchAPI, URLS.getFileById(projectId, binaryId), token);
  return data;
}

/* IMAGE */

function* openImageModalsWorker({ payload: { projectId, binaryId } }) {
  const data = yield call(fetchImageData, { projectId, binaryId });
  yield put(showModalAction({ id: 'attachmentImageModal', data }));
}

function* openImageModalWatcher() {
  yield takeLatest(GET_ATTACHMENT_IMAGE, openImageModalsWorker);
}

/* HAR */

function* openHarModalsWorker({ payload }) {
  const harData = yield call(fetchData, payload);
  yield put(showModalAction({ id: 'attachmentHarFileModal', data: { harData } }));
}

function* openHarModalWatcher() {
  yield takeLatest(GET_ATTACHMENT_HAR, openHarModalsWorker);
}

/* BINARY */

function* openBinaryModalsWorker({ payload }) {
  const binaryData = yield call(fetchData, payload);
  const content =
    payload.language.toLowerCase() === 'json' ? JSON.stringify(binaryData, null, 4) : binaryData;
  yield put(
    showModalAction({
      id: 'attachmentCodeModal',
      data: { language: payload.language, content },
    }),
  );
}

function* openBinaryModalWatcher() {
  yield takeLatest(GET_ATTACHMENT_BINARY, openBinaryModalsWorker);
}

export function* attachmentSagas() {
  yield all([openImageModalWatcher(), openHarModalWatcher(), openBinaryModalWatcher()]);
}
