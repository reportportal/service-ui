import { all } from 'redux-saga/effects';
import { notificationSagas } from 'controllers/notification';

export function* rootSagas() {
  yield all([notificationSagas()]);
}
