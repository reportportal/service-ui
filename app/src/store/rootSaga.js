import { all } from 'redux-saga/effects';
import { notificationSagas } from 'controllers/notification';
import { authSagas } from 'controllers/auth/sagas';

export function* rootSagas() {
  yield all([notificationSagas(), authSagas()]);
}
