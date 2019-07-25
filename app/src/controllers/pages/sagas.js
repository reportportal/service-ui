import { put, takeEvery, select, all } from 'redux-saga/effects';
import isEqual from 'fast-deep-equal';
import { mergeQuery } from 'common/utils/routingUtils';
import { UPDATE_PAGE_PROPERTIES } from './constants';
import { locationSelector } from './selectors';

function* updatePageProperties({ payload: properties }) {
  const { type, payload, query } = yield select(locationSelector);
  const newQuery = mergeQuery(query, properties);

  if (isEqual(query, newQuery)) {
    return;
  }

  const updatedAction = {
    type,
    payload,
    meta: { query: newQuery },
  };

  yield put(updatedAction);
}

function* watchUpdatePageProperties() {
  yield takeEvery(UPDATE_PAGE_PROPERTIES, updatePageProperties);
}

export function* pageSagas() {
  yield all([watchUpdatePageProperties()]);
}
