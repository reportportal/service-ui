import { takeLatest, call, put, all, select, take } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showModalAction, HIDE_MODAL } from 'controllers/modal';
import { concatFetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { activeRetryIdSelector } from 'controllers/log/selectors';
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
  const activeLogItemId = yield select(activeRetryIdSelector);
  yield put(
    concatFetchDataAction(ATTACHMENTS_NAMESPACE, concat)(
      URLS.logItems(activeProject, activeLogItemId),
      { params },
    ),
  );
}

export function fetchImageData({ binaryId }) {
  return fetch(URLS.getFileById(binaryId), { responseType: 'blob' });
}

export function fetchData({ binaryId }) {
  return fetch(URLS.getFileById(binaryId));
}

/* IMAGE */
function* openImageModalsWorker({ binaryId }) {
  const data = yield call(fetchImageData, { binaryId });
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
    const data = yield call(fetch, URLS.getFileById(id), { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    window.open(url);
    URL.revokeObjectURL(url);
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
