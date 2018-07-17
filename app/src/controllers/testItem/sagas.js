import { redirect } from 'redux-first-router';
import {
  FETCH_SUCCESS,
  fetchDataAction,
  fetchSuccessAction,
  bulkFetchDataAction,
} from 'controllers/fetch';
import { put, select, all, takeEvery, take, call } from 'redux-saga/effects';
import {
  testItemIdsArraySelector,
  launchIdSelector,
  pagePropertiesSelector,
  payloadSelector,
  TEST_ITEM_PAGE,
  pathnameChangedSelector,
} from 'controllers/pages';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { setLevelAction, setPageLoadingAction } from './actionCreators';
import { FETCH_TEST_ITEMS, NAMESPACE, PARENT_ITEMS_NAMESPACE, RESTORE_PATH } from './constants';
import { LEVELS } from './levels';
import {
  namespaceSelector,
  parentItemSelector,
  queryParametersSelector,
  isLostLaunchSelector,
} from './selectors';
import { calculateLevel } from './utils';

const createTestItemActionPredicate = (namespace) => (action) =>
  action.type === FETCH_SUCCESS && action.meta && action.meta.namespace === namespace;

function* updateLaunchId(launchId) {
  const payload = yield select(payloadSelector);
  const query = yield select(pagePropertiesSelector);
  const testItemIdsArray = yield select(testItemIdsArraySelector);
  yield put(
    redirect({
      type: TEST_ITEM_PAGE,
      payload: {
        ...payload,
        testItemIds: [launchId, ...testItemIdsArray.slice(1)].join('/'),
      },
      meta: { query },
    }),
  );
}

function* restorePath() {
  const parentItem = yield select(parentItemSelector);
  if (!parentItem) {
    return;
  }
  yield call(updateLaunchId, parentItem.launchId);
}

function* fetchParentItems() {
  const itemIds = yield select(testItemIdsArraySelector);
  const project = yield select(activeProjectSelector);
  const urls = itemIds.map(
    (id, i) => (i === 0 ? URLS.launch(project, id) : URLS.testItem(project, id)),
  );
  yield put(bulkFetchDataAction(PARENT_ITEMS_NAMESPACE, true)(urls));
  yield take(createTestItemActionPredicate(PARENT_ITEMS_NAMESPACE));
}

function* fetchTestItems() {
  const isPathNameChanged = yield select(pathnameChangedSelector);
  if (isPathNameChanged) {
    yield put(setPageLoadingAction(true));
    yield call(fetchParentItems);
  }
  const itemIds = yield select(testItemIdsArraySelector);
  let launchId = yield select(launchIdSelector);
  const isLostLaunch = yield select(isLostLaunchSelector);
  let parentId;
  if (isLostLaunch) {
    const parentItem = yield select(parentItemSelector);
    launchId = parentItem ? parentItem.launchId : launchId;
  }
  if (itemIds.length > 1) {
    parentId = itemIds[itemIds.length - 1];
  }
  const project = yield select(activeProjectSelector);
  const namespace = yield select(namespaceSelector);
  const query = yield select(queryParametersSelector, namespace);

  const noChildFilter = 'filter.eq.has_childs' in query;

  const sizePath = !parentId && !noChildFilter ? 0 : undefined;

  yield put(
    fetchDataAction(NAMESPACE)(URLS.testItems(project), {
      params: {
        'filter.eq.launch': launchId,
        'filter.eq.parent': !noChildFilter ? parentId : undefined,
        'filter.size.path': sizePath,
        'filter.in.path': noChildFilter ? parentId : undefined,
        ...query,
      },
    }),
  );
  const dataPayload = yield take(createTestItemActionPredicate(NAMESPACE));
  const level = calculateLevel(dataPayload.payload.content);

  if (LEVELS[level]) {
    yield put(fetchSuccessAction(LEVELS[level].namespace, dataPayload.payload));
  }
  yield put(setLevelAction(level));
  yield put(setPageLoadingAction(false));
}

function* watchRestorePath() {
  yield takeEvery(RESTORE_PATH, restorePath);
}

function* watchFetchTestItems() {
  yield takeEvery(FETCH_TEST_ITEMS, fetchTestItems);
}

export function* testItemsSaga() {
  yield all([watchFetchTestItems(), watchRestorePath()]);
}
