import { all } from 'redux-saga/effects';
import { notificationSagas } from 'controllers/notification';
import { authSagas } from 'controllers/auth/sagas';
import { fetchSagas } from 'controllers/fetch';
import { launchSagas } from 'controllers/launch';

export function* rootSagas() {
  yield all([notificationSagas(), authSagas(), fetchSagas(), launchSagas()]);
}
