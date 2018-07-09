import { FETCH_SUCCESS, fetchDataAction, fetchSuccessAction } from 'controllers/fetch';
import { put, select, all, takeEvery, take } from 'redux-saga/effects';
import { testItemIdsArraySelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { setLevelAction } from './actionCreators';
import { FETCH_TEST_ITEMS, NAMESPACE } from './constants';
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

function* fetchTestItems() {
  const itemIds = yield select(testItemIdsArraySelector);
  let parentId;
  if (itemIds.length > 1) {
    parentId = itemIds[itemIds.length - 1];
  }
  const launchId = itemIds[0];
  const project = yield select(activeProjectSelector);

  const namespace = yield select(namespaceSelector);
  const query = yield select(queryParametersSelector, namespace);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.testItem(project, launchId, parentId), {
      params: { ...query },
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
