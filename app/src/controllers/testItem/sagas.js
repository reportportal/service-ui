import {
  FETCH_SUCCESS,
  fetchDataAction,
  fetchSuccessAction,
  bulkFetchDataAction,
} from 'controllers/fetch';
import { put, select, all, takeEvery, take, call } from 'redux-saga/effects';
import { testItemIdsArraySelector, launchIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { setLevelAction } from './actionCreators';
import { FETCH_TEST_ITEMS, NAMESPACE, PARENT_ITEMS_NAMESPACE } from './constants';
import { LEVELS } from './levels';
import { namespaceSelector, queryParametersSelector } from './selectors';

const testItemActionPredicate = (action) =>
  action.type === FETCH_SUCCESS && action.meta && action.meta.namespace === NAMESPACE;

const calculateLevel = (data) =>
  data.reduce((acc, item) => {
    if (!acc) {
      return item.type;
    }
    const type = item.type;
    return LEVELS[acc] && LEVELS[acc].order > LEVELS[type].order ? type : acc;
  }, '');

function* fetchParentItems() {
  const itemIds = yield select(testItemIdsArraySelector);
  const project = yield select(activeProjectSelector);
  const urls = itemIds.map(
    (id, i) => (i === 0 ? URLS.launch(project, id) : URLS.testItem(project, id)),
  );
  yield put(bulkFetchDataAction(PARENT_ITEMS_NAMESPACE)(urls));
}

function* fetchTestItems() {
  yield call(fetchParentItems);
  const itemIds = yield select(testItemIdsArraySelector);
  const launchId = yield select(launchIdSelector);
  let parentId;
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
  const dataPayload = yield take(testItemActionPredicate);
  const level = calculateLevel(dataPayload.payload.content);

  if (LEVELS[level]) {
    yield put(fetchSuccessAction(LEVELS[level].namespace, dataPayload.payload));
  }
  yield put(setLevelAction(level));
}

function* watchFetchTestItems() {
  yield takeEvery(FETCH_TEST_ITEMS, fetchTestItems);
}

export function* testItemsSaga() {
  yield all([watchFetchTestItems()]);
}
