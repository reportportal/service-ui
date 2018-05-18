import { delay } from 'redux-saga';
import { all, call, takeEvery, put } from 'redux-saga/effects';
import { SHOW_NOTIFICATION } from './constants';
import { hideNotification } from './actionCreators';

function* hideNotificationDelay({ payload }) {
  yield call(delay, 8000);
  yield put(hideNotification(payload.uid));
}

function* watchAddNotification() {
  yield takeEvery(SHOW_NOTIFICATION, hideNotificationDelay);
}

export function* notificationSagas() {
  yield all([watchAddNotification()]);
}
