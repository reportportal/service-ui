import { takeLatest, call, put, all, select } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showModalAction } from 'controllers/modal';
import { concatFetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { activeLogIdSelector } from 'controllers/log/selectors';
import { JSON as JSON_TYPE } from 'common/constants/fileTypes';
import {
  ATTACHMENT_IMAGE_MODAL_ID,
  ATTACHMENT_CODE_MODAL_ID,
  ATTACHMENT_HAR_FILE_MODAL_ID,
  OPEN_ATTACHMENT_ACTION,
  FETCH_ATTACHMENTS_CONCAT_ACTION,
  ATTACHMENTS_NAMESPACE,
} from './constants';
import { getAttachmentModalId, extractExtension } from './utils';

function* fetchAttachmentsConcat({ payload: { params, concat } }) {
  const activeProject = yield select(activeProjectSelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    concatFetchDataAction(ATTACHMENTS_NAMESPACE, concat)(
      URLS.logItems(activeProject, activeLogItemId),
      { params },
    ),
  );
}

export function fetchImageData({ binaryId }) {
  return Promise.resolve({ image: URLS.getFileById(binaryId) });
}

export function fetchData({ binaryId }) {
  return fetch(URLS.getFileById(binaryId));
}

/* IMAGE */
function* openImageModalsWorker({ binaryId }) {
  const data = yield call(fetchImageData, { binaryId });
  yield put(showModalAction({ id: ATTACHMENT_IMAGE_MODAL_ID, data }));
}

/* HAR */
function* openHarModalsWorker(data) {
  const harData = yield call(fetchData, data);
  yield put(showModalAction({ id: ATTACHMENT_HAR_FILE_MODAL_ID, data: { harData } }));
}

/* BINARY */
function* openBinaryModalsWorker(data) {
  const binaryData = yield call(fetchData, data);
  const content = data.extension === JSON_TYPE ? JSON.stringify(binaryData, null, 4) : binaryData;
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
  if (modalId) {
    const data = { binaryId: id, extension: extractExtension(contentType) };
    try {
      yield call(ATTACHMENT_MODAL_WORKERS[modalId], data);
    } catch (e) {} // eslint-disable-line no-empty
  } else {
    window.open(URLS.getFileById(id));
  }
}

function* watchFetchAttachments() {
  yield takeLatest(FETCH_ATTACHMENTS_CONCAT_ACTION, fetchAttachmentsConcat);
}

function* watchOpenAttachment() {
  yield takeLatest(OPEN_ATTACHMENT_ACTION, openAttachment);
}

export function* attachmentSagas() {
  yield all([watchOpenAttachment(), watchFetchAttachments()]);
}
