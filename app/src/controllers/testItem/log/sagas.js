import { all, call, put, select, takeEvery, take } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  logItemIdSelector,
  pagePropertiesSelector,
  pathnameChangedSelector,
} from 'controllers/pages';
import { fetchDataAction } from 'controllers/fetch';
import { fetchAttachmentsConcatAction } from 'controllers/attachments';
import { fetchTestItemsAction, fetchTestItemsSuccessAction } from 'controllers/testItem';
import { clearTestItemAttachmentsAction } from './actionCreators';
import {
  TEST_ITEM_LOG_ITEMS_NAMESPACE,
  FETCH_TEST_ITEM_LOG_DATA,
  DEFAULT_LOG_LEVEL,
  TEST_ITEM_LOG,
  TEST_ITEM_ATTACHMENTS_NAMESPACE,
  FETCH_TEST_ITEM_ATTACHMENTS,
  LOG_LEVEL_FILTER_KEY,
  NAMESPACE,
} from './constants';
import { testItemTypeSelector, querySelector } from './selectors';

function* collectLogPayload() {
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);
  const filterLevel = query[LOG_LEVEL_FILTER_KEY] || DEFAULT_LOG_LEVEL;
  const logItemId = yield select(logItemIdSelector);
  const testItemType = yield select(testItemTypeSelector);
  const fullParams = yield select(pagePropertiesSelector, NAMESPACE);
  const params = Object.keys(fullParams).reduce((acc, key) => {
    if (key === LOG_LEVEL_FILTER_KEY) {
      return acc;
    }
    return { ...acc, [key]: fullParams[key] };
  }, {});
  return {
    activeProject,
    params,
    filterLevel,
    logItemId,
    testItemType,
  };
}

function* fetchLogItems(payload = {}) {
  const { activeProject, params, filterLevel, logItemId, testItemType } = yield call(
    collectLogPayload,
  );
  const namespace = payload.namespace || TEST_ITEM_LOG_ITEMS_NAMESPACE;
  const logLevel = payload.level || filterLevel;
  const fetchParams = {
    ...params,
    ...payload.params,
  };
  const url =
    testItemType === TEST_ITEM_LOG
      ? URLS.testItemLogs(activeProject, logItemId, logLevel)
      : URLS.launchLogs(activeProject, logItemId, logLevel);
  yield put(
    fetchDataAction(namespace)(url, {
      params: fetchParams,
    }),
  );
}

function* fetchAttachmentsConcat({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const logItemId = yield select(logItemIdSelector);
  const testItemType = yield select(testItemTypeSelector);
  const url =
    testItemType === TEST_ITEM_LOG
      ? URLS.testItemLogs(activeProject, logItemId)
      : URLS.launchLogs(activeProject, logItemId);
  yield put(fetchAttachmentsConcatAction(TEST_ITEM_ATTACHMENTS_NAMESPACE)(url)(payload));
}

function* fetchTestItemLogPage() {
  yield put(clearTestItemAttachmentsAction());
  yield put(fetchTestItemsAction());
  yield take(fetchTestItemsSuccessAction);
  yield call(fetchLogItems);
}

function* fetchTestItemLogsPage({ meta = {} }) {
  const isPathNameChanged = yield select(pathnameChangedSelector);
  if (meta.refresh || isPathNameChanged) {
    yield call(fetchTestItemLogPage);
    return;
  }
  yield call(fetchLogItems);
}

function* watchFetchTestItemLogsPage() {
  yield takeEvery(FETCH_TEST_ITEM_LOG_DATA, fetchTestItemLogsPage);
}

function* watchFetchAttachmentsConcat() {
  yield takeEvery(FETCH_TEST_ITEM_ATTACHMENTS, fetchAttachmentsConcat);
}

export function* testItemLogsSagas() {
  yield all([watchFetchTestItemLogsPage(), watchFetchAttachmentsConcat()]);
}
